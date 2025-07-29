from parser_parametros import parsear_busqueda_subvenciones, buscar_convocatorias
import pandas as pd

# Texto de prueba
query = "quiero ayudas para vivienda en la comunidad de madrid"

# Paso 1: Parsear la consulta
filtros = parsear_busqueda_subvenciones(query)
print("🎯 Filtros extraídos:")
print(filtros)

# Paso 2: Buscar convocatorias
convocatorias = buscar_convocatorias(**filtros)
print("\n📋 Resultados encontrados:")
print(convocatorias.head())  # Solo muestra las primeras filas
