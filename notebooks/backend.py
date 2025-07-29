# app.py
from flask import Flask, request, jsonify
import torch
import gc
from transformers import AutoTokenizer, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer
import os

app = Flask(__name__)

# === Carga de modelos y embeddings al iniciar el servidor ===
device = "cuda" if torch.cuda.is_available() else "cpu"
model_id_llm = "microsoft/phi-2"
model_id_embeddings = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

print("⏳ Cargando modelo LLM...")
tokenizer_llm = AutoTokenizer.from_pretrained(model_id_llm)
model_llm = AutoModelForCausalLM.from_pretrained(
    model_id_llm,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto"
)
model_llm.eval()

embedding_model = SentenceTransformer(model_id_embeddings, device=device)

# === Cargar texto y generar embeddings de los chunks ===
with open("TextoConvocatoria.txt", "r", encoding="utf-8") as f:
    full_text = f.read()

def split_text(text, max_len=500, overlap=50):
    chunks, pos = [], 0
    while pos < len(text):
        end = min(pos + max_len, len(text))
        chunks.append(text[pos:end])
        pos += max_len - overlap
    return chunks

chunks = split_text(full_text)
chunk_embeddings = embedding_model.encode(chunks, convert_to_tensor=True)

print("✅ Modelos y datos cargados.")

# === Ruta de la API para responder preguntas ===
@app.route('/preguntar', methods=['POST'])
def preguntar():
    pregunta = request.json.get("pregunta", "")
    if not pregunta:
        return jsonify({"error": "No se proporcionó ninguna pregunta"}), 400

    # Embedding de la pregunta
    pregunta_embedding = embedding_model.encode(pregunta, convert_to_tensor=True).to(device)

    # Similitud con chunks
    similitudes = torch.nn.functional.cosine_similarity(pregunta_embedding.unsqueeze(0), chunk_embeddings)
    top_indices = torch.topk(similitudes, k=3).indices.tolist()
    contexto = "\n\n".join([chunks[i] for i in top_indices])

    # Crear el prompt
    prompt = f"""Instrucción: Basándote ÚNICAMENTE en el siguiente texto de contexto, responde a la pregunta. Si la información no está en el contexto, di que no tienes suficiente información.

Contexto:
{contexto}

Pregunta: {pregunta}
Respuesta:"""

    # Generar la respuesta
    input_ids = tokenizer_llm(prompt, return_tensors="pt").to(model_llm.device)
    with torch.no_grad():
        output = model_llm.generate(
            **input_ids,
            max_new_tokens=200,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer_llm.pad_token_id,
            eos_token_id=tokenizer_llm.eos_token_id
        )

    response_text = tokenizer_llm.decode(output[0], skip_special_tokens=True)
    respuesta = response_text.split("Respuesta:", 1)[-1].strip()
    return jsonify({"respuesta": respuesta})

if __name__ == '__main__':
    app.run(debug=True)
