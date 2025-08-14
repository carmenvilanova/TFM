# main.py
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from parser_openai_edo_url import data_frame_resumen
from rag import preguntar_al_modelo_rag  # extrae la función de RAG
import uvicorn

app = FastAPI()

# Permitir CORS para que el frontend (Vercel) pueda llamar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringir a tu dominio
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ask")
async def ask_subvencion(question: str = Body(..., embed=True)):
    # Paso 1: buscar convocatorias relevantes (logica Luisito)
    df = data_frame_resumen(question)
    if df.empty:
        return {"answer": "No se encontraron convocatorias relacionadas."}

    # Paso 2: Aquí se podría elegir una convocatoria y descargar sus documentos
    # (o varias, según la lógica que se defina)
    # entonces aqui se pasa a texto eso


    # Paso 3: hacer la pregunta al RAG con el contexto :D
    answer = preguntar_al_modelo_rag(question)

    return {
        "answer": answer,
        "convocatorias": df.to_dict(orient="records")
    }

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
