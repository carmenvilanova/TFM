# TFM - Sistema de Recuperación Aumentada por Generación (RAG) para Convocatorias Públicas

## 📋 Descripción del Proyecto

Este proyecto implementa un sistema completo de **Recuperación Aumentada por Generación (RAG)** para consultar y analizar documentos oficiales de convocatorias públicas en España. El sistema consta de una API backend desarrollada en **FastAPI** y una aplicación frontend moderna en **React + TypeScript**, permitiendo extraer, procesar y consultar información relevante de documentos PDF descargados desde APIs públicas del Gobierno de España.

### 🎯 Objetivos Principales
- **Extracción automática** de convocatorias públicas desde la API del Gobierno
- **Procesamiento inteligente** de documentos PDF mediante técnicas de NLP y OpenAI
- **Sistema de consulta RAG** para obtener respuestas precisas sobre convocatorias
- **Interfaz web moderna** multiidioma para interactuar con el sistema
- **Análisis de datos** de convocatorias a través de notebooks Jupyter
- **Despliegue containerizado** con Docker y Docker Compose

## 🏗️ Arquitectura del Sistema

```
TFM/
├── api_busqueda/           # Backend API (FastAPI)
│   ├── main.py            # Aplicación principal FastAPI
│   ├── rag_openai.py      # Implementación RAG con OpenAI
│   ├── parser_openai_edo_url.py # Parser de documentos y URLs
│   ├── config.py          # Configuración de OpenAI
│   ├── requirements.txt   # Dependencias backend
│   └── Dockerfile         # Imagen Docker backend
├── web/project/           # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Componentes React reutilizables
│   │   ├── hooks/         # Custom hooks
│   │   ├── i18n/          # Internacionalización (ES, EN, FR, DE)
│   │   ├── types/         # Definiciones TypeScript
│   │   └── utils/         # Utilidades
│   ├── package.json       # Dependencias frontend
│   ├── vite.config.ts     # Configuración Vite
│   ├── tailwind.config.js # Configuración TailwindCSS
│   └── Dockerfile         # Imagen Docker frontend
├── notebooks/             # Jupyter Notebooks para experimentación
│   ├── convocatorias.ipynb      # Análisis de convocatorias
│   ├── implementacion_v1.ipynb  # Prototipo inicial
│   ├── Rag_gpt4_o_mini.ipynb   # RAG con GPT-4o mini
│   ├── parser_openAI-3.ipynb   # Parser con OpenAI
│   └── documentos_convocatoria/ # Documentos de prueba
├── documentos_convocatoria/     # Documentos oficiales
├── docker-compose.yml     # Orquestación de servicios
└── requirements.txt       # Dependencias globales
```

## 🚀 Tecnologías Utilizadas

### Backend (Python/FastAPI)
- **FastAPI**: Framework web moderno y rápido para APIs
- **OpenAI API**: Modelos GPT-4o mini y embeddings text-embedding-3-small
- **LangChain**: Framework para aplicaciones con LLMs
- **FAISS**: Búsqueda de similitud vectorial eficiente
- **PDFPlumber**: Extracción de texto de documentos PDF
- **Pandas & NumPy**: Manipulación y análisis de datos
- **Uvicorn**: Servidor ASGI de alta performance
- **Pydantic**: Validación de datos y serialización
- **Sentence-Transformers**: Modelos de embeddings semánticos
- **PyTorch**: Framework de deep learning
- **Requests**: Cliente HTTP para APIs gubernamentales
- **Python-Multipart**: Manejo de archivos multipart

### Frontend (React/TypeScript)
- **React 18.3.1**: Librería de interfaz de usuario moderna
- **TypeScript 5.5.3**: Superset tipado de JavaScript
- **Vite 5.4.2**: Herramienta de construcción y desarrollo ultrarrápida
- **TailwindCSS 3.4.1**: Framework de utilidades CSS
- **React i18next**: Internacionalización (ES, EN, FR, DE)
- **Lucide React**: Librería de iconos SVG
- **Clsx & Tailwind-merge**: Utilidades para clases CSS
- **ESLint**: Linter para código JavaScript/TypeScript

### Herramientas de Desarrollo y Despliegue
- **Docker & Docker Compose**: Containerización y orquestación
- **Nginx**: Servidor web para producción (frontend)
- **Jupyter Notebooks**: Experimentación y prototipado
- **Git**: Control de versiones

### APIs Externas
- **BDNS API**: Base de Datos Nacional de Subvenciones del Gobierno de España
- **OpenAI API**: Modelos de lenguaje y embeddings

## 📋 Requisitos del Sistema

### Requisitos Mínimos
- **Python**: 3.11 o superior
- **Node.js**: 18.0 o superior  
- **npm**: 9.0 o superior
- **Docker**: 20.0 o superior (opcional, para despliegue containerizado)
- **Docker Compose**: 2.0 o superior (opcional)
- **OpenAI API Key**: Requerida para funcionalidad RAG

### Requisitos Recomendados
- **RAM**: 8GB mínimo, 16GB recomendado
- **Almacenamiento**: 5GB libres
- **GPU**: Opcional (acelera el procesamiento de modelos con FAISS-GPU)

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/carmenvilanova/TFM.git
cd TFM
```

### 2. Configurar el Backend (API)

#### 2.1. Entorno Virtual de Python (Recomendado)
```bash
# Crear entorno virtual
python -m venv tfm_env

# Activar entorno virtual
# Windows:
tfm_env\Scripts\activate
# macOS/Linux:
source tfm_env/bin/activate

# Navegar al directorio del backend
cd api_busqueda

# Instalar dependencias del backend
pip install -r requirements.txt
```

#### 2.2. Configurar OpenAI API Key
```bash
# Crear archivo de configuración en api_busqueda/
echo "your-openai-api-key-here" > openai_api_key.txt
```

#### 2.3. Iniciar el servidor backend
```bash
# Desde api_busqueda/
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Configurar el Frontend

#### 3.1. Instalar dependencias
```bash
# Navegar al directorio del frontend
cd web/project

# Instalar dependencias de Node.js
npm install
```

#### 3.2. Configurar variables de entorno (opcional)
```bash
# Crear archivo .env en web/project/ (opcional)
echo "VITE_API_URL=http://localhost:8000" > .env
```

#### 3.3. Iniciar el servidor de desarrollo
```bash
# Desde web/project/
npm run dev
```

### 4. Configuración con Docker (Opción Alternativa)

#### 4.1. Usando Docker Compose (Recomendado)
```bash
# Desde la raíz del proyecto
# Asegúrate de tener el archivo openai_api_key.txt en api_busqueda/
docker-compose up --build
```

#### 4.2. Construcción manual de imágenes
```bash
# Backend
cd api_busqueda
docker build -t tfm-backend .

# Frontend  
cd ../web/project
docker build -t tfm-frontend .

# Ejecutar contenedores
docker run -d -p 8000:8000 tfm-backend
docker run -d -p 80:80 tfm-frontend
```

## 🚀 Uso del Sistema

### Acceso a la Aplicación

Una vez configurado e iniciado, el sistema estará disponible en:

- **Frontend (Interfaz Web)**: http://localhost:5173 (desarrollo) o http://localhost:80 (Docker)
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs (Swagger UI automática)

### Funcionalidades Principales

#### 1. Búsqueda de Convocatorias
- Busca convocatorias públicas por términos clave
- Visualiza resultados con metadatos completos
- Descarga documentos PDF individuales o en ZIP

#### 2. Sistema RAG (Recuperación Aumentada por Generación)
- Carga documentos PDF al sistema
- Procesa documentos con embeddings OpenAI
- Realiza consultas en lenguaje natural
- Obtiene respuestas contextualizadas

#### 3. Interfaz Multiidioma
- Soporte para español, inglés, francés y alemán
- Cambio dinámico de idioma
- Detección automática del idioma del navegador

### Desarrollo con Notebooks

#### Experimentación con Jupyter
```bash
# Desde la raíz del proyecto, activar entorno virtual
source tfm_env/bin/activate  # o tfm_env\Scripts\activate en Windows

# Instalar Jupyter si no está instalado
pip install jupyter

# Iniciar Jupyter
jupyter notebook

# Notebooks disponibles:
# - notebooks/convocatorias.ipynb: Análisis de convocatorias
# - notebooks/Rag_gpt4_o_mini.ipynb: Experimentación RAG
# - notebooks/implementacion_v1.ipynb: Prototipo inicial
```

### Modo Producción

#### Frontend
```bash
# Desde web/project/
npm run build
npm run preview
```

#### Backend
```bash
# Desde api_busqueda/
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Docker Compose (Recomendado para Producción)
```bash
# Desde la raíz del proyecto
docker-compose up --build -d
```

## 📊 API Endpoints Disponibles

### Backend API (FastAPI)

#### Búsqueda de Convocatorias
- `POST /convocatorias` - Buscar convocatorias por término
- `GET /convocatorias/{numconv}/documentos` - Listar documentos de una convocatoria
- `GET /documentos/{doc_id}` - Descargar documento específico
- `GET /convocatorias/{numconv}/documentos.zip` - Descargar todos los documentos en ZIP

#### Sistema RAG
- `POST /procesar_documento` - Procesar documento PDF para RAG
- `POST /preguntar_rag` - Realizar consulta al sistema RAG

### Ejemplo de Uso de API

```bash
# Buscar convocatorias
curl -X POST "http://localhost:8000/convocatorias" \
  -H "Content-Type: application/json" \
  -d '{"texto": "investigación"}'

# Consultar al sistema RAG
curl -X POST "http://localhost:8000/preguntar_rag" \
  -H "Content-Type: application/json" \
  -d '{"pregunta": "¿Cuáles son los requisitos de esta convocatoria?"}'
```

## 🔧 Configuración Avanzada

### Variables de Entorno

#### Backend (api_busqueda/)
```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# RAG Configuration  
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBED_MODEL=text-embedding-3-small
CHUNK_SIZE=500
OVERLAP_SIZE=50

# API Configuration
API_BASE_URL=https://www.pap.hacienda.gob.es/bdnstrans/api/convocatorias/busqueda
```

#### Frontend (web/project/)
```env
# API Configuration
VITE_API_URL=http://localhost:8000
REACT_APP_API_URL=http://localhost:8000
```

### Configuración de OpenAI
El sistema utiliza los siguientes modelos de OpenAI:
- **Generación de respuestas**: `gpt-4o-mini`
- **Embeddings**: `text-embedding-3-small`
- **Vector Store**: FAISS para búsqueda de similitud

### Configuración de Docker

#### Docker Compose Variables
```yaml
# En docker-compose.yml
services:
  frontend:
    build:
      context: ./web/project
      args:
        REACT_APP_API_URL: https://your-domain.com/
```

### Configuración de Producción

#### Nginx (Frontend)
```nginx
# Configuración básica incluida en Dockerfile
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Uvicorn (Backend)
```bash
# Configuración de producción
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📈 Análisis de Datos y Experimentación

### Notebooks Jupyter Disponibles
- **`notebooks/convocatorias.ipynb`**: Análisis exploratorio de convocatorias
- **`notebooks/Rag_gpt4_o_mini.ipynb`**: Experimentación con RAG y GPT-4o mini
- **`notebooks/Rag_gpt4_o_mini_v2.ipynb`**: Versión mejorada del sistema RAG
- **`notebooks/implementacion_v1.ipynb`**: Prototipo inicial del sistema
- **`notebooks/parser_openAI-3.ipynb`**: Desarrollo del parser con OpenAI
- **`notebooks/parser_de_parametros_embed.ipynb`**: Análisis de embeddings
- **`notebooks/diario.ipynb`**: Seguimiento del desarrollo

### Datos de Prueba
- **`notebooks/documentos_convocatoria/`**: PDFs de convocatorias de ejemplo
- **`notebooks/listado_convocatorias.xlsx`**: Dataset de convocatorias
- **Archivos TXT**: Versiones procesadas de documentos PDF

### Scripts de Desarrollo
- **`notebooks/rag_prueba_v1.py`**: Script de pruebas RAG v1
- **`notebooks/rag_prueba_v2.py`**: Script de pruebas RAG v2
- **`notebooks/backend.py`**: Funciones de backend para notebooks

## 🐛 Solución de Problemas

### Problemas Comunes

#### Error de OpenAI API Key
```bash
# Verificar que el archivo existe
ls api_busqueda/openai_api_key.txt

# Verificar contenido (sin mostrar la key)
wc -l api_busqueda/openai_api_key.txt
```

#### Error de Dependencias Python
```bash
# Actualizar pip
python -m pip install --upgrade pip

# Reinstalar dependencias del backend
cd api_busqueda
pip install -r requirements.txt --force-reinstall
```

#### Error de Dependencias Node.js
```bash
# Limpiar cache de npm
cd web/project
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### Error de Conexión entre Frontend y Backend
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/docs

# Verificar configuración de CORS en main.py
# Verificar VITE_API_URL en frontend
```

#### Error de Docker
```bash
# Limpiar contenedores e imágenes
docker-compose down
docker system prune -f

# Reconstruir
docker-compose up --build
```

#### Error de Memoria/Performance
- Reducir `CHUNK_SIZE` en configuración RAG
- Usar `faiss-cpu` en lugar de `faiss-gpu` si hay problemas
- Aumentar RAM disponible del sistema
- Usar menos workers en Uvicorn

### Logs y Debugging

#### Backend (FastAPI)
```bash
# Logs detallados del backend
cd api_busqueda
uvicorn main:app --reload --log-level debug

# Verificar endpoints
curl http://localhost:8000/docs
```

#### Frontend (React)
```bash
# Logs de desarrollo
cd web/project
npm run dev

# Build con información detallada
npm run build -- --mode development
```

#### Docker Logs
```bash
# Ver logs de contenedores
docker-compose logs api_busqueda
docker-compose logs frontend

# Seguir logs en tiempo real
docker-compose logs -f
```

## 📚 Documentación Adicional

### APIs y Servicios Externos
- **BDNS API**: Base de Datos Nacional de Subvenciones del Gobierno de España
  - Documentación: https://www.pap.hacienda.gob.es/bdnstrans/
  - Endpoint base: `https://www.pap.hacienda.gob.es/bdnstrans/api/convocatorias/busqueda`
- **OpenAI API**: Modelos de lenguaje y embeddings
  - Documentación: https://platform.openai.com/docs
  - Modelos utilizados: `gpt-4o-mini`, `text-embedding-3-small`

### Referencias Técnicas
- **RAG (Retrieval-Augmented Generation)**: https://arxiv.org/abs/2005.11401
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **LangChain**: https://python.langchain.com/
- **FAISS**: https://faiss.ai/
- **Vite**: https://vitejs.dev/
- **TailwindCSS**: https://tailwindcss.com/

### Estructura de Datos
#### Formato de Respuesta de Convocatorias
```json
{
  "resultados": [
    {
      "numconv": 1234567,
      "titulo": "Título de la convocatoria",
      "organismo": "Ministerio correspondiente",
      "fecha_publicacion": "2024-01-01",
      "url_documentos": "https://..."
    }
  ]
}
```

#### Formato de Respuesta RAG
```json
{
  "resultados": [
    {
      "respuesta": "Respuesta generada por el modelo RAG basada en el contexto de los documentos procesados."
    }
  ]
}
```

## 🚀 Despliegue en Producción

### Opción 1: Despliegue con Docker Compose
```bash
# 1. Configurar variables de entorno
export REACT_APP_API_URL="https://your-backend-domain.com"

# 2. Asegurar que tienes la API key de OpenAI
echo "your-openai-api-key" > api_busqueda/openai_api_key.txt

# 3. Desplegar
docker-compose up --build -d

# 4. Verificar servicios
docker-compose ps
```

### Opción 2: Despliegue Separado

#### Backend (FastAPI)
```bash
# En servidor de backend
cd api_busqueda
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Frontend (React/Nginx)
```bash
# En servidor de frontend
cd web/project
npm install
npm run build

# Servir con nginx o servidor web de tu elección
# Los archivos de build están en dist/
```

### Consideraciones de Seguridad
- **API Keys**: Nunca commiter las API keys al repositorio
- **CORS**: Configurar adecuadamente los orígenes permitidos en producción
- **HTTPS**: Usar certificados SSL en producción
- **Rate Limiting**: Implementar límites de velocidad para la API
- **Autenticación**: Considerar implementar autenticación para usuarios

## 📄 Licencia

Este proyecto es parte de un Trabajo Fin de Máster (TFM) y está sujeto a las políticas académicas correspondientes.

## 👨‍💻 Autores

**Trabajo Fin de Máster (TFM)** - Universidad Complutense de Madrid

### Información del Proyecto
- **Institución**: Universidad Complutense de Madrid
- **Programa**: Máster en [Nombre del Máster]
- **Tipo**: Trabajo Fin de Máster (TFM)
- **Tema**: Sistema RAG para Convocatorias Públicas

---

## 📝 Información Técnica del Proyecto

### Versiones de Software
- **Python**: 3.11+
- **Node.js**: 18.0+
- **React**: 18.3.1
- **TypeScript**: 5.5.3
- **FastAPI**: 0.116.1
- **OpenAI**: 1.99.9
- **Docker**: 20.0+
- **Docker Compose**: 2.0+

### Estado del Proyecto
- ✅ **Backend API**: Funcional y documentado
- ✅ **Frontend Web**: Interfaz completa con i18n
- ✅ **Sistema RAG**: Implementado con OpenAI
- ✅ **Containerización**: Docker y Docker Compose
- ✅ **Documentación**: README completo
- ✅ **Notebooks**: Experimentación y análisis

### Características Implementadas
- [x] Búsqueda de convocatorias públicas
- [x] Descarga de documentos PDF
- [x] Procesamiento RAG con OpenAI
- [x] Interfaz web multiidioma (ES, EN, FR, DE)
- [x] API RESTful documentada
- [x] Despliegue con Docker
- [x] Sistema de autenticación básico
- [x] Manejo de archivos y metadatos

### Próximas Mejoras Potenciales
- [ ] Implementar cache de respuestas RAG
- [ ] Añadir más filtros de búsqueda
- [ ] Implementar sistema de usuarios completo
- [ ] Optimizar performance con índices vectoriales
- [ ] Añadir análisis de sentimientos
- [ ] Implementar notificaciones de nuevas convocatorias

---

**¡Gracias por revisar este proyecto! Si tienes preguntas o sugerencias, no dudes en contactarnos.**