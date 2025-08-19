import os
from pathlib import Path

def get_openai_api_key():
    """
    Lee la clave de API de OpenAI desde un archivo de texto.
    El archivo debe estar en la misma carpeta que este script.
    """
    # Obtener la ruta del directorio actual
    current_dir = Path(__file__).parent
    
    # Ruta al archivo de configuración
    config_file = current_dir / "openai_api_key.txt"
    
    try:
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                api_key = f.read().strip()
                if api_key:
                    return api_key
                else:
                    raise ValueError("El archivo openai_api_key.txt está vacío")
        else:
            raise FileNotFoundError(
                f"No se encontró el archivo openai_api_key.txt en {current_dir}. "
                "Por favor, crea este archivo con tu clave de API de OpenAI."
            )
    except Exception as e:
        raise Exception(f"Error al leer la clave de API: {str(e)}")

def get_openai_client():
    """
    Crea y retorna un cliente de OpenAI con la clave de API configurada.
    """
    from openai import OpenAI
    api_key = get_openai_api_key()
    return OpenAI(api_key=api_key)
