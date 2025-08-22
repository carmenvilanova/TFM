# rag.py
import os
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

# ======== VARIABLES GLOBALES PARA LAZY LOADING ========
embedding_model = None
tokenizer_llm = None
model_llm = None
device_embeddings = "cuda" if torch.cuda.is_available() else "cpu"
text_chunks = []
chunk_embeddings = None

# ======== FUNCIONES DE CARGA LAZY ========
def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        print("🔹 Cargando modelo de embeddings...")
        embedding_model = SentenceTransformer(MODEL_ID_EMBEDDINGS, device=device_embeddings)
    return embedding_model

def get_llm_model():
    global tokenizer_llm, model_llm
    if tokenizer_llm is None or model_llm is None:
        print("🔹 Cargando LLM...")
        tokenizer_llm = AutoTokenizer.from_pretrained(MODEL_ID_LLM, trust_remote_code=True)
        model_llm = AutoModelForCausalLM.from_pretrained(
            MODEL_ID_LLM,
            torch_dtype=torch.bfloat16 if torch.cuda.is_available() and torch.is_bf16_supported() else torch.float16,
            device_map=None,
            trust_remote_code=True
        )
        model_llm.eval()
        if tokenizer_llm.pad_token is None:
            tokenizer_llm.pad_token = tokenizer_llm.eos_token
        tokenizer_llm.padding_side = 'left'
    return tokenizer_llm, model_llm

# ======== FUNCIONES AUXILIARES ========
def split_text_into_chunks(text, max_chunk_size=500, overlap_size=50):
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

# ======== FUNCIONES PRINCIPALES ========
def procesar_documentos_convocatoria(documentos):
    """
    Procesa PDFs locales de la convocatoria y genera embeddings.
    `documentos` debe ser una lista de dicts con 'id' y 'nombreFic'.
    """
    global text_chunks, chunk_embeddings
    embedding_model = get_embedding_model()  # lazy loading

    os.makedirs(PDF_FOLDER, exist_ok=True)
    all_text = []

    # Leer PDFs locales
    for doc in documentos:
        nombre = doc.get('nombreFic', f"documento_{doc['id']}.pdf")
        pdf_path = os.path.join(PDF_FOLDER, nombre)

        if not os.path.exists(pdf_path):
            print(f"❌ Archivo no encontrado: {pdf_path}")
            continue

        print(f"📄 Procesando {nombre} ...")
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        all_text.append(text)
        except Exception as e:
            print(f"❌ Error procesando {nombre}: {e}")

    if not all_text:
        print("❌ No se extrajo texto de los PDFs.")
        return

    unified_text = "\n".join(all_text)
    with open(TEXT_FILE, "w", encoding="utf-8") as f:
        f.write(unified_text)

    # Dividir en chunks y generar embeddings
    text_chunks = split_text_into_chunks(unified_text, max_chunk_size=500, overlap_size=50)
    chunk_embeddings = embedding_model.encode(text_chunks, convert_to_tensor=True, show_progress_bar=True)

    print(f"✅ Procesamiento completo: {len(text_chunks)} fragmentos, embeddings listos.")

def preguntar_al_modelo_rag(pregunta_usuario, top_k=3, max_new_tokens=200, temperature=0.7):
    """
    Busca en los embeddings el contexto más relevante y responde usando el LLM.
    """
    global text_chunks, chunk_embeddings
    embedding_model = get_embedding_model()  # lazy loading
    tokenizer, model = get_llm_model()      # lazy loading

    if not text_chunks or chunk_embeddings is None:
        return "⚠️ No hay documentos procesados aún. Por favor, procesa primero una convocatoria."

    # Embedding de la pregunta
    pregunta_embedding = embedding_model.encode(pregunta_usuario, convert_to_tensor=True).to(device_embeddings)

    # Buscar fragmentos más relevantes
    similarities = torch.nn.functional.cosine_similarity(pregunta_embedding.unsqueeze(0), chunk_embeddings)
    top_k_indices = torch.topk(similarities, top_k).indices.tolist()
    relevant_chunks = [text_chunks[i] for i in top_k_indices]
    context = "\n\n".join(relevant_chunks)

    if device_embeddings == "cuda":
        torch.cuda.empty_cache()
    gc.collect()

    # Prompt para el LLM
    prompt = f"""Instrucción: Basándote ÚNICAMENTE en el siguiente texto de contexto, responde a la pregunta.
Si la información no está en el contexto, indica que no tienes suficiente información.

Contexto:
{context}

Pregunta: {pregunta_usuario}
Respuesta: """

    # Generar respuesta
    input_ids = tokenizer(prompt, return_tensors="pt", return_attention_mask=False).to(model.device)
    with torch.no_grad():
        output = model.generate(
            **input_ids,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=temperature,
            top_p=0.9,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

    response = tokenizer.decode(output[0], skip_special_tokens=False)

    if "Respuesta: " in response:
        cleaned_response = response.split("Respuesta: ", 1)[1].strip()
        cleaned_response = cleaned_response.replace("<|endoftext|>", "").strip()
        cleaned_response = cleaned_response.split("Instrucción:", 1)[0].strip()
    else:
        cleaned_response = response

    return cleaned_response
