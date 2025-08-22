FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código
COPY . /app

# Crear carpeta para archivos subidos
RUN mkdir -p /app/uploaded_docs

EXPOSE 8000

# CMD para desarrollo
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "debug"]
