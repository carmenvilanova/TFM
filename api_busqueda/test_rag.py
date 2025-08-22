# test_rag.py
from rag import procesar_documentos_convocatoria, preguntar_al_modelo_rag

print("rag.py importado correctamente")

# Probar procesar documentos con un ejemplo vacío
try:
    print("Llamando a procesar_documentos_convocatoria([])...")
    procesar_documentos_convocatoria([])
    print("procesar_documentos_convocatoria terminó correctamente")
except Exception as e:
    print("Error en procesar_documentos_convocatoria:", e)

# Probar la función de preguntas
try:
    print("Llamando a preguntar_al_modelo_rag('Prueba de pregunta')...")
    respuesta = preguntar_al_modelo_rag("Prueba de pregunta")
    print("preguntar_al_modelo_rag respondió:", respuesta)
except Exception as e:
    print("Error en preguntar_al_modelo_rag:", e)
