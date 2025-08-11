import sys
import json
from parser_parametros import parsear_busqueda_subvenciones, buscar_convocatorias

def main():
    print("INICIO", file=sys.stderr)
    input_text = sys.argv[1]
    print(f"Input: {input_text}", file=sys.stderr)
    
    print("Antes de parsear_busqueda_subvenciones", file=sys.stderr)
    filtros = parsear_busqueda_subvenciones(input_text)
    print(f"Después de parsear_busqueda_subvenciones: {filtros}", file=sys.stderr)
    
    print("Antes de buscar_convocatorias", file=sys.stderr)
    convocatorias = buscar_convocatorias(**filtros)
    print("Después de buscar_convocatorias", file=sys.stderr)
    
    resultados = []
    for row in convocatorias.head(10).to_dict(orient="records"):
        resultados.append({
            "id": row.get("id", ""),
            "title": row.get("descripcion", ""),  # O usa otro campo si prefieres
            "description": row.get("descripcion", ""),
            "deadline": row.get("fechaRecepcion", ""),
            "amount": "",  # Si tienes campo de importe, ponlo aquí
            "category": row.get("nivel1", ""),
        })
    print("Resultados preparados", file=sys.stderr)
    
    print(json.dumps(resultados))  # Devolver JSON por stdout

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)