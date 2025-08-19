# Importar librerías
import requests
import pandas as pd
import numpy as np
import regex as re
import datetime
import time
import openpyxl
from sentence_transformers import SentenceTransformer
import pdfplumber
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, TrainingArguments
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training, PeftModel
import torch
from trl import SFTTrainer
import gc
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.vectorstores import Chroma
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch
import os
from openai import OpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI


# Definir clases
class get_convocatorias:
    def __init__(self, param_grid, url, headers_grid ): 
        self.param_grid = param_grid
        self.url = url
        self.headers_grid = headers_grid
        self.downloaded_convs_id = list()
        self.error_convs = list()
        self.txt_convs = {}
        
    def pdf_to_txt(self, pdf_folder, output_name_root):
        self.txt_convs = {}
        for filename in os.listdir(pdf_folder):
            if filename.endswith(".pdf"):
                filepath = os.path.join(pdf_folder, filename)
                print(f"Extrayendo texto de: {filename}")
                try:
                    with pdfplumber.open(filepath) as pdf:
                        text_id = re.split("_", filename)[1].split(".")[0]
                        
                        all_text = []
                        for page in pdf.pages:
                            text = page.extract_text()
                            if text: # Asegurarse de que se extrajo algo de texto
                                all_text.append(text)
                    
                        unified_text = "\n".join(all_text)    
                        
                         # Guardar el texto unificado en un archivo .txt
                        with open(f"{output_name_root}_{text_id}.txt", "w", encoding="utf-8") as f:
                            f.write(unified_text)
                            
                        print(f"\nTexto de {len(os.listdir(pdf_folder))} PDFs extraído y guardado en '{output_name_root}_{text_id}'")
                        self.txt_convs[text_id] = unified_text
                        
                except Exception as e:
                    print(f"Error al procesar {filename}: {e}")
                    
                    
                    
# Iniciar clase
base_url = "https://www.infosubvenciones.es/bdnstrans/api/convocatorias"
params = {"vpd": "GE"}        # Cambia por el portal que te interese
headers = {"Accept": "application/json"}
get_convs = get_convocatorias(param_grid=params, url=base_url, headers_grid=headers)


# Convertir a texto
pdf_folder = os.path.join(os.getcwd(), "TFM/notebooks/documentos_convocatoria")
out_put_txt_file = "Texto_convocatoria"
get_convs.pdf_to_txt(pdf_folder=pdf_folder, output_name_root=out_put_txt_file)


unified_text = get_convs.txt_convs["1286483"] # Asumiendo que esta es la convocatoria. Tal vez tenemos que reemplazar por una función 
                                              # que encuentra el pdf sin necesidad de usar su nombre. Depende de la estructura de la carpeta. 


text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
texts = text_splitter.split_text(unified_text)
print(f"Texto dividido en {len(texts)} chunks")


api_key = ""
client = OpenAI(api_key=api_key)
user_query = "¿De qué trata este documento?"

# 2. Crear embeddings
embedding_model = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=api_key)
vectorstore = FAISS.from_texts(texts, embedding_model)

# 3. Buscar contexto relevante
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
relevant_docs = retriever.get_relevant_documents(user_query)

# 4. Concatenar el contexto
context = "\n\n".join([doc.page_content for doc in relevant_docs])

# Definir prompt
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

 
"""

# 5. Llamar a GPT-4o-mini con contexto manual
client = OpenAI(api_key=api_key)
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": f"Contexto:\n{context}\n\nPregunta:\n{user_query}"},
        {"role": "system", "content": prompt}    
    ],
    temperature=0.3,
    max_tokens=600  # Limitamos la salida del modelo a 100 tokens para probar como funciona. En el futuro habrá que deslimitalo

)


def responder_pregunta(query, prompt=prompt, k=3, max_tokens=600):
    
    if user_query.lower() in ["salir", "exit", "quit"]:
        print("Hasta luego.")
    
    # Buscar contexto relevante
    docs = vectorstore.similarity_search(query, k=k)
    context = "\n\n".join([doc.page_content for doc in docs])

    # Llamar a GPT-4o-mini con contexto
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Contexto:\n{context}\n\nPregunta:\n{query}"}
        ],
        temperature=0.3,
        max_tokens=max_tokens
    )

    # Mostrar respuesta
    print("\n🧠 Respuesta:")
    print(response.choices[0].message.content)
    


if __name__ == '__main__':
    user_query = input("\n❓ Escribe tu pregunta (o 'salir'): ")
    responder_pregunta(user_query)

