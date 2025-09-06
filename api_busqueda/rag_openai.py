import os
import pdfplumber
import gc
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from openai import OpenAI

# ======== CONFIGURACIÓN ========
PDF_FOLDER = "data/documentos_convocatoria"
TEXT_FILE = "TextoConvocatoria.txt"
OPENAI_MODEL = "gpt-4o-mini"
OPENAI_EMBED_MODEL = "text-embedding-3-small"
API_KEY_FILE = "openai_api_key.txt"

# ======== VARIABLES GLOBALES PARA LAZY LOADING ========
embedding_model = None
vectorstore = None
text_chunks = []
client = None
api_key_cache = None

# ======== FUNCIONES DE CARGA DE API KEY ========
def load_api_key():
    global api_key_cache
    if api_key_cache is None:
        if not os.path.exists(API_KEY_FILE):
            raise FileNotFoundError(f"❌ No se encontró el archivo {API_KEY_FILE} con la API key.")
        with open(API_KEY_FILE, "r", encoding="utf-8") as f:
            api_key_cache = f.read().strip()
            if not api_key_cache:
                raise ValueError("❌ El archivo de API key está vacío.")
    return api_key_cache

# ======== FUNCIONES DE CARGA LAZY ========
def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        print("🔹 Cargando modelo de embeddings OpenAI...")
        api_key = load_api_key()
        embedding_model = OpenAIEmbeddings(model=OPENAI_EMBED_MODEL, openai_api_key=api_key)
    return embedding_model

def get_openai_client():
    global client
    if client is None:
        print("🔹 Inicializando cliente OpenAI...")
        api_key = load_api_key()
        client = OpenAI(api_key=api_key)
    return client

# ======== FUNCIONES AUXILIARES ========
def split_text_into_chunks(text, max_chunk_size=1000, overlap_size=200):
    splitter = RecursiveCharacterTextSplitter(chunk_size=max_chunk_size, chunk_overlap=overlap_size)
    return splitter.split_text(text)

# ======== FUNCIONES PRINCIPALES ========
def procesar_documentos_convocatoria(documentos):
    """
    Procesa PDFs locales de la convocatoria y genera embeddings con OpenAI.
    `documentos` debe ser una lista de dicts con 'id' y 'nombreFic'.
    """
    global text_chunks, vectorstore
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

    # Dividir en chunks y generar embeddings + FAISS
    text_chunks = split_text_into_chunks(unified_text, max_chunk_size=1000, overlap_size=200)
    vectorstore = FAISS.from_texts(text_chunks, embedding_model)

    print(f"✅ Procesamiento completo: {len(text_chunks)} fragmentos, FAISS listo.")

def preguntar_al_modelo_rag(pregunta_usuario, top_k=3, max_tokens=600, temperature=0.3):
    """
    Busca en los embeddings el contexto más relevante y responde usando GPT-4o-mini.
    """
    global text_chunks, vectorstore
    embedding_model = get_embedding_model()
    client = get_openai_client()

    if not text_chunks or vectorstore is None:
        return "⚠️ No hay documentos procesados aún. Por favor, procesa primero una convocatoria."

    # Buscar contexto relevante
    docs = vectorstore.similarity_search(pregunta_usuario, k=top_k)
    context = "\n\n".join([doc.page_content for doc in docs])

    # Prompt
    prompt = """
Eres un asistente experto en ayudas públicas en España. Responde en tono claro y amigable, basado únicamente en el contexto que se te proporciona. 
Si no encuentras la respuesta a la consulta en el documento, debes decir que no has podido encontrar la información relevante e invitar 
al usuario a que revise el documento.

Si el usuario te pide un resumen del documento, proporciona una respuesta clara y en lenguaje simple del contenido del documento. Indica al usuario el mensaje principal del documento y si se trata de alguna subvención o ayuda a la que pueda aplicar. En caso de que no, 
debes indicar que este documento no tiene ningún información sobre ayudas o subvenciones. Si el documento incluye información de ayudas, haz un resumen
de los requisitos que se deben cumplir para acceder a la ayuda e indica al usuario el título de la sección en la que puede encontrar la información detallada sobre
cómo aplicar a la ayuda, si ese título existe. 

Si el usuario te pide información sobre cómo aplicar a la ayuda descrita en el documento, haz un resumen de los requisitos de aplicación indicados en el documento e indícale la página o la sección del documento en donde puede encontrar toda la información sobre los requisitos de aplicación. 

Si el usuario te pregunta si la convocatoria le puede ayudar o servir, pregunta sobre su edad, ocupación o profesión y lugar de residencia en España. Indícale si la convocatoria se ajusta al usuario en función de esa información. Nunca digas que la convocatoria no se ajusta. Más bien, especifica a quién va dirigida la convocatoria
según los requisitos en el documento e invítale a revisarlos para que evalúe si se ajustan a sus necesidades. 

Nunca des información que no encuentres en el documento. Si hay algo que no encuentras, debes decir al usuario que no has encontrado esa información en el documento e invitarle a que lo revise por su propia cuenta. 
Termina siempre preguntando al usuario en tono amable si le puedes ayudar an algo más. 
    
"""

    # Llamar a GPT-4o-mini
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Contexto:\n{context}\n\nPregunta:\n{pregunta_usuario}"}
        ],
        temperature=temperature,
        max_tokens=max_tokens
    )

    gc.collect()

    return response.choices[0].message.content.strip()