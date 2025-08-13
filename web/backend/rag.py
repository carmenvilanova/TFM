# rag.py
import os
import requests
import pdfplumber
import torch
import gc
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM

# ======== CONFIGURACIÓN ========
MODEL_ID_LLM = "microsoft/phi-2"
MODEL_ID_EMBEDDINGS = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
PDF_FOLDER = "data/documentos_convocatoria"
TEXT_FILE = "TextoConvocatoria.txt"

# ======== CARGA DE MODELOS (solo una vez) ========
device_embeddings = "cuda" if torch.cuda.is_available() else "cpu"
embedding_model = SentenceTransformer(MODEL_ID_EMBEDDINGS, device=device_embeddings)

tokenizer_llm = AutoTokenizer.from_pretrained(MODEL_ID_LLM, trust_remote_code=True)
model_llm = AutoModelForCausalLM.from_pretrained(
    MODEL_ID_LLM,
    torch_dtype=torch.bfloat16 if torch.cuda.is_available() and torch.cuda.is_bf16_supported() else torch.float16,
    device_map="auto",
    trust_remote_code=True,
)
model_llm.eval()

if tokenizer_llm.pad_token is None:
    tokenizer_llm.pad_token = tokenizer_llm.eos_token
tokenizer_llm.padding_side = 'left'

# ======== VARIABLES GLOBALES ========
text_chunks = []
chunk_embeddings = None


# ======== FUNCIONES ========

def split_text_into_chunks(text, max_chunk_size=500, overlap_size=50):
    """Divide un texto en fragmentos solapados para embeddings."""
    chunks = []
    current_pos = 0
    while current_pos < len(text):
        end_pos = min(current_pos + max_chunk_size, len(text))
        chunk = text[current_pos:end_pos]
        chunks.append(chunk)
        current_pos += max_chunk_size - overlap_size
        if current_pos >= len(text) - overlap_size:
            break
    return chunks


def procesar_documentos_convocatoria(documentos):
    """
    Descarga PDFs de la convocatoria, extrae el texto y genera embeddings.
    `documentos` debe ser una lista de dicts con 'id' y 'nombreFic'.
    """
    global text_chunks, chunk_embeddings

    os.makedirs(PDF_FOLDER, exist_ok=True)
    all_text = []

    # 1. Descargar y extraer texto
    for doc in documentos:
        id_doc = doc['id']
        nombre = doc.get('nombreFic', f"documento_{id_doc}.pdf")
        url = f"https://www.infosubvenciones.es/bdnstrans/api/convocatorias/documentos?idDocumento={id_doc}"
        
        print(f"📥 Descargando {nombre} ...")
        resp = requests.get(url)
        if resp.status_code == 200:
            pdf_path = os.path.join(PDF_FOLDER, nombre)
            with open(pdf_path, "wb") as f:
                f.write(resp.content)

            # Extraer texto
            try:
                with pdfplumber.open(pdf_path) as pdf:
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            all_text.append(text)
            except Exception as e:
                print(f"❌ Error procesando {nombre}: {e}")
        else:
            print(f"❌ Error al descargar {nombre}")

    unified_text = "\n".join(all_text)
    with open(TEXT_FILE, "w", encoding="utf-8") as f:
        f.write(unified_text)

    # 2. Dividir en chunks y generar embeddings
    text_chunks = split_text_into_chunks(unified_text, max_chunk_size=500, overlap_size=50)
    chunk_embeddings = embedding_model.encode(text_chunks, convert_to_tensor=True, show_progress_bar=True)

    print(f"✅ Procesamiento completo: {len(text_chunks)} fragmentos, embeddings listos.")


def preguntar_al_modelo_rag(pregunta_usuario, top_k=3, max_new_tokens=200, temperature=0.7):
    """
    Busca en los embeddings el contexto más relevante y responde usando el LLM.
    """
    global text_chunks, chunk_embeddings

    if not text_chunks or chunk_embeddings is None:
        return "⚠️ No hay documentos procesados aún. Por favor, procesa primero una convocatoria."

    # 1. Embedding de la pregunta
    pregunta_embedding = embedding_model.encode(pregunta_usuario, convert_to_tensor=True).to(device_embeddings)

    # 2. Buscar fragmentos más relevantes
    similarities = torch.nn.functional.cosine_similarity(pregunta_embedding.unsqueeze(0), chunk_embeddings)
    top_k_indices = torch.topk(similarities, top_k).indices.tolist()
    relevant_chunks = [text_chunks[i] for i in top_k_indices]
    context = "\n\n".join(relevant_chunks)

    # Liberar memoria temporal
    if device_embeddings == "cuda":
        torch.cuda.empty_cache()
    gc.collect()

    # 3. Prompt para el LLM
    prompt = f"""Instrucción: Basándote ÚNICAMENTE en el siguiente texto de contexto, responde a la pregunta.
Si la información no está en el contexto, indica que no tienes suficiente información.

Contexto:
{context}

Pregunta: {pregunta_usuario}
Respuesta: """

    # 4. Generar respuesta
    input_ids = tokenizer_llm(prompt, return_tensors="pt", return_attention_mask=False).to(model_llm.device)
    with torch.no_grad():
        output = model_llm.generate(
            **input_ids,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=temperature,
            top_p=0.9,
            pad_token_id=tokenizer_llm.pad_token_id,
            eos_token_id=tokenizer_llm.eos_token_id
        )

    response = tokenizer_llm.decode(output[0], skip_special_tokens=False)

    # Limpiar respuesta
    if "Respuesta: " in response:
        cleaned_response = response.split("Respuesta: ", 1)[1].strip()
        cleaned_response = cleaned_response.replace("<|endoftext|>", "").strip()
        cleaned_response = cleaned_response.split("Instrucción:", 1)[0].strip()
    else:
        cleaned_response = response

    return cleaned_response
