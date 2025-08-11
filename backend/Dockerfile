FROM node:18-bullseye

# Instalar Python 3.9 y herramientas necesarias
RUN apt-get update && \
    apt-get install -y python3.9 python3.9-distutils curl && \
    ln -sf /usr/bin/python3.9 /usr/bin/python3 && \
    curl -sS https://bootstrap.pypa.io/get-pip.py | python3

# Crear carpeta de trabajo
WORKDIR /app

# Copiar e instalar dependencias de Node.js
COPY package*.json ./
RUN npm install

# 👉 Copiar SOLO requirements.txt primero para aprovechar caché
COPY ./archivos_py/requirements.txt ./archivos_py/requirements.txt

# 👉 Instalar paquetes Python y aprovechar caché si no ha cambiado
RUN pip3 install --break-system-packages -r ./archivos_py/requirements.txt

# Copiar el resto de archivos del proyecto (después de instalar paquetes)
COPY . .

# Exponer puerto
EXPOSE 4000

# Comando por defecto
CMD ["node", "index.js"]
