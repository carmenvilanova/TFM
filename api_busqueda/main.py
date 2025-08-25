from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os
from urllib.parse import quote


from rag_openai import procesar_documentos_convocatoria, preguntar_al_modelo_rag
from fastapi.middleware.cors import CORSMiddleware
from parser_openai_edo_url import (
    data_frame_resumen,
    obtener_ids_y_nombres,          # ya lo tienes
    BASE_DOC_URL,                   # ya lo tienes
    descargar_documentos_a_disco,   # (opcional) para RAG/cache local
)
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import requests, io, zipfile

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
os.makedirs("data/documentos_convocatoria", exist_ok=True)

# --- Búsqueda de convocatorias ---
class Pregunta(BaseModel):
    texto: str

@app.post("/convocatorias")
def obtener_convocatorias(pregunta: Pregunta):
    try:
        df = data_frame_resumen(pregunta.texto)
        if not isinstance(df, pd.DataFrame):
            print("ERROR: data_frame_resumen no devolvió un DataFrame")
            return {"error": "data_frame_resumen no devolvió un DataFrame"}
        df_clean = df.replace([np.inf, -np.inf], np.nan).fillna("no info")
        resultados = df_clean.to_dict(orient="records")
        print("Convocatorias:", resultados)
        return {"resultados": resultados}
    except Exception as e:
        print("ERROR:", str(e))
        return {"error": str(e)}

# --- Procesar documento para RAG ---
@app.post("/procesar_documento")
async def procesar_documento(file: UploadFile = File(...)):
    # Guarda el archivo subido en la carpeta que espera el RAG
    save_path = f"data/documentos_convocatoria/{file.filename}"
    os.makedirs("data/documentos_convocatoria", exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(await file.read())
    # Procesa el documento con RAG
    procesar_documentos_convocatoria([{"id": file.filename, "nombreFic": file.filename}])
    return {"status": "procesado", "filename": file.filename}

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


    # --- ENDPOINT: listar documentos reales de una convocatoria ---
@app.get("/convocatorias/{numconv}/documentos")
def listar_documentos(numconv: int):
    docs = obtener_ids_y_nombres(numconv)
    return {
        "has": bool(docs),
        "documentos": [
            {
                "id": d["id"],
                "name": d["name"],
                # pasamos el nombre como query param para usarlo en Content-Disposition
                "download": f"/documentos/{d['id']}?name={quote(d['name'])}"
            }
            for d in docs
        ],
        "zip": f"/convocatorias/{numconv}/documentos.zip" if docs else None
    }



# --- ENDPOINT: descarga directa de UN PDF (streaming) ---
@app.get("/documentos/{doc_id}")
def descargar_documento(doc_id: int, name: str | None = None):
    r = requests.get(BASE_DOC_URL.format(doc_id), timeout=30)
    if not r.ok:
        raise HTTPException(status_code=404, detail="Documento no disponible")

    filename = name or f"{doc_id}"  # usamos el nombre que vino en la lista
    media_type = r.headers.get("Content-Type") or "application/octet-stream"

    return StreamingResponse(
        io.BytesIO(r.content),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# --- ENDPOINT: ZIP con TODOS los PDFs de una convocatoria ---
@app.get("/convocatorias/{numconv}/documentos.zip")
def descargar_zip(numconv: int):
    """
    Empaqueta en memoria todos los PDFs y los sirve como ZIP.
    """
    try:
        docs = obtener_ids_y_nombres(numconv)  # [{id,name}]
    except Exception:
        docs = []

    if not docs:
        raise HTTPException(status_code=404, detail="Sin documentos para esta convocatoria")

    mem = io.BytesIO()
    with zipfile.ZipFile(mem, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for d in docs:
            try:
                r = requests.get(BASE_DOC_URL.format(d["id"]), timeout=30)
                if r.ok:
                    z.writestr(d["name"], r.content)
            except requests.RequestException:
                # si un doc falla, seguimos con los demás
                continue

    mem.seek(0)
    return StreamingResponse(
        mem,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="convocatoria_{numconv}.zip"'}
    )


