# subvenciones.py
import sys
import json
from parser_parametros import parsear_busqueda_subvenciones, buscar_convocatorias

def main():
    input_text = sys.argv[1]
    filtros = parsear_busqueda_subvenciones(input_text)
    convocatorias = buscar_convocatorias(**filtros)
    resultados = convocatorias.head(10).to_dict(orient="records")
    print(json.dumps(resultados))  # Devolver JSON por stdout

if __name__ == "__main__":
    main()
