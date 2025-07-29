# TFM - Sistema de Recuperación Aumentada por Generación (RAG) para Convocatorias Públicas

## 📋 Descripción del Proyecto

Este proyecto implementa un sistema de **Recuperación Aumentada por Generación (RAG)** para consultar y analizar documentos oficiales de convocatorias públicas en España. El sistema permite extraer, procesar y consultar información relevante de documentos PDF descargados desde APIs públicas del Gobierno de España.

### 🎯 Objetivos Principales
- **Extracción automática** de convocatorias públicas desde la API del Gobierno
- **Procesamiento inteligente** de documentos PDF mediante técnicas de NLP
- **Sistema de consulta RAG** para obtener respuestas precisas sobre convocatorias
- **Interfaz web moderna** para interactuar con el sistema
- **Análisis de datos** de convocatorias 

## 🏗️ Arquitectura del Sistema

```
TFM/
├── src/                    # Código fuente principal (Python)
│   └── rag.py             # Implementación del sistema RAG
├── notebooks/              # Jupyter Notebooks para experimentación
│   ├── rag.ipynb          # Notebook principal del sistema RAG
│   ├── convocatorias.ipynb # Análisis de convocatorias
│   ├── TFM.ipynb          # Notebook principal del TFM
│   └── backend.py         # Script de backend
├── web/                    # Aplicación web frontend
│   └── project/           # Proyecto Vite + React + TypeScript
├── data/                   # Datos de entrada y procesamiento
│   ├── convocatoria_842695.xlsx
│   ├── listado_convocatorias.xlsx
│   └── documentos_convocatoria/
├── outputs/                # Resultados generados
│   └── documentos_convocatoria/
└── requirements.txt        # Dependencias de Python
```

## 🚀 Tecnologías Utilizadas

### Backend (Python)
- **Transformers & Sentence-Transformers**: Modelos de lenguaje y embeddings
- **PyTorch**: Framework de deep learning
- **Pandas & OpenPyXL**: Procesamiento de datos y Excel
- **PDFPlumber**: Extracción de texto de PDFs
- **Requests**: Cliente HTTP para APIs
- **Scikit-learn**: Machine learning
- **Jupyter**: Notebooks para experimentación

### Frontend (Web)
- **React 18**: Librería de interfaz de usuario
- **TypeScript**: Superset tipado de JavaScript
- **Vite**: Herramienta de desarrollo rápida
- **TailwindCSS**: Framework de utilidades CSS
- **Framer Motion**: Animaciones
- **Lucide React**: Iconos

## 📋 Requisitos del Sistema

### Requisitos Mínimos
- **Python**: 3.8 o superior
- **Node.js**: 18.0 o superior
- **GPU**: Opcional (acelera el procesamiento de modelos)

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <https://github.com/carmenvilanova/TFM>
cd TFM
```

### 2. Configurar el Entorno Python

#### Opción A: Entorno Virtual (Recomendado) :)
```bash
# Crear entorno virtual
python -m venv tfm_env

# Activar entorno virtual
# Windows:
tfm_env\Scripts\activate
# macOS/Linux:
source tfm_env/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar el Frontend
```bash
# Navegar al directorio del frontend
cd web/project

# Instalar dependencias
npm install

# Iniciar en local el frontend
npm run dev
```

## 🚀 Uso del Sistema

### Ejecutar el Backend (Sistema RAG)

#### Opción 1: Script Python Directo
```bash
# Desde la raíz del proyecto
python src/rag.py
```

#### Opción 2: Jupyter Notebook
```bash
# Iniciar Jupyter
jupyter notebook

# Abrir notebooks/rag.ipynb
```

#### Modo Producción
```bash
cd web/project
npm run build
npm run preview
```

## 📊 Funcionalidades Principales

### 1. Extracción de Convocatorias
- **API Integration**: Conexión automática con la API del Gobierno de España
- **Filtrado inteligente**: Búsqueda por sector
- **Descarga automática**: PDFs de convocatorias relevantes

### 2. Procesamiento de Documentos
- **Extracción de texto**: De documentos PDF
- **Chunking inteligente**: División en fragmentos procesables
- **Embeddings**: Generación de vectores semánticos

### 3. Sistema RAG
- **Búsqueda semántica**: Encuentra información relevante
- **Generación de respuestas**: Basada en contexto extraído
- **Ranking de resultados**: Ordenamiento por relevancia

### 4. Interfaz Web
- **Consulta interactiva**: Formulario de preguntas
- **Visualización de resultados**: Presentación clara de respuestas
- **Historial de consultas**: Seguimiento de búsquedas

## 🔧 Configuración Avanzada

### Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto:
```env
# Configuración de la API
API_BASE_URL=https://www.pap.hacienda.gob.es/bdnstrans/api/convocatorias/busqueda
API_VPD=GE

# Configuración del modelo RAG
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
CHUNK_SIZE=500
OVERLAP_SIZE=50

# Configuración de la aplicación web
VITE_API_URL=http://localhost:8000
```

### Configuración de Modelos
El sistema utiliza modelos pre-entrenados de Hugging Face:
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
- **Generación**: Modelos de transformers para respuestas

## 📈 Análisis de Datos

### Notebooks Disponibles
- **`rag.ipynb`**: Implementación completa del sistema RAG
- **`convocatorias.ipynb`**: Análisis específico de convocatorias
- **`TFM.ipynb`**: Notebook principal del trabajo de investigación
- **`diario.ipynb`**: Seguimiento del desarrollo

### Métricas y Evaluación
- **Precisión de respuestas**: Evaluación de calidad
- **Tiempo de respuesta**: Performance del sistema
- **Cobertura de datos**: Análisis de convocatorias procesadas

## 🐛 Solución de Problemas

### Problemas Comunes

#### Error de Dependencias Python
```bash
# Actualizar pip
python -m pip install --upgrade pip

# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

#### Error de Memoria
- Reducir `page_size` en la configuración
- Usar `max_paginas` más pequeño
- Aumentar RAM disponible

#### Error de Conexión API
- Verificar conectividad a internet
- Comprobar parámetros de la API
- Revisar límites de rate limiting

### Logs y Debugging
```bash
# Activar logs detallados
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python -u src/rag.py
```

## 📚 Documentación Adicional

### APIs Utilizadas
- **BDNS API**: Base de Datos Nacional de Subvenciones
- **Documentación**: https://www.pap.hacienda.gob.es/bdnstrans/

### Referencias Técnicas
- **RAG**: Retrieval-Augmented Generation
- **Sentence Transformers**: https://www.sbert.net/
- **Transformers**: https://huggingface.co/transformers/

## 📄 Licencia

Este proyecto es parte de un Trabajo Fin de Máster (TFM) y está sujeto a las políticas académicas correspondientes.

## 👨‍💻 Autor

**Estudiantes TFM** - Universidad Complutense de Madrid

### Contactos
- **Email**: [Nuestros emails]
- **LinkedIn**: [Nuestros perfiles]
- **GitHub**: [Nuestros GitHubs]

---

## 📝 Notas de Desarrollo

### Versiones
- **Python**: 3.11+
- **Node.js**: 18.0+
- **React**: 18.3.1
- **TypeScript**: 5.5.3