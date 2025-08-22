from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os

from parser_openai_edo_url import data_frame_resumen
from rag import procesar_documentos_convocatoria, preguntar_al_modelo_rag
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

PDF_FOLDER = "data/documentos_convocatoria"


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # más flexible
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear carpeta si no existe
os.makedirs("uploaded_docs", exist_ok=True)

# --- Búsqueda de convocatorias ---
class Pregunta(BaseModel):
    texto: str

@app.post("/convocatorias")
def obtener_convocatorias(pregunta: Pregunta):
    try:
        df = data_frame_resumen(pregunta.texto)
        if not isinstance(df, pd.DataFrame):
            return {"error": "data_frame_resumen no devolvió un DataFrame"}
        df_clean = df.replace([np.inf, -np.inf], np.nan).fillna("no info")
        return {"resultados": df_clean.to_dict(orient="records")}
    except Exception as e:
        return {"error": str(e)}

# --- Procesar documento para RAG ---
@app.post("/procesar_documento")
async def procesar_documento(file: UploadFile = File(...)):
    try:
        # Guardar el PDF en la carpeta correcta
        os.makedirs(PDF_FOLDER, exist_ok=True)
        save_path = os.path.join(PDF_FOLDER, file.filename)
        with open(save_path, "wb") as f:
            f.write(await file.read())

        # Procesar el PDF localmente
        procesar_documentos_convocatoria([{"id": file.filename, "nombreFic": file.filename}])
        return {"status": "procesado", "filename": file.filename}
    except Exception as e:
        return {"error": str(e)}

# --- Preguntar al RAG ---
class RAGPregunta(BaseModel):
    pregunta: str

@app.post("/preguntar_rag")
def preguntar_rag(req: RAGPregunta):
    try:
        respuesta = preguntar_al_modelo_rag(req.pregunta)
        return {"resultados": [{"respuesta": respuesta}]}
    except Exception as e:
        return {"error": str(e)}
