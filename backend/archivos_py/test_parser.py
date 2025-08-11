import sys
import json
from parser_parametros import parsear_busqueda_subvenciones, buscar_convocatorias

def main():
    input_text = sys.argv[1]
    filtros = parsear_busqueda_subvenciones(input_text)
    convocatorias = buscar_convocatorias(**filtros)

    resultados = []
    for row in convocatorias.head(10).to_dict(orient="records"):
        resultados.append({
            "id": str(row.get("id", "")),
            "title": row.get("descripcion", ""),
            "description": row.get("descripcion", ""),
            "deadline": row.get("fechaRecepcion", ""),
            "amount": row.get("importe", ""),  # si no existe, devolver ""
            "category": row.get("nivel1", ""),
        })

    respuesta = {
        "reply": {
            "results": resultados,  # lista de GrantCall
            "total": len(convocatorias),
            "filters_used": filtros
        }
    }

    print(json.dumps(respuesta, ensure_ascii=False))

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
