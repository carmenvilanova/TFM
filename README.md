# TFM - Sistema de Recuperación Aumentada por Generación (RAG)

## Descripción
Este proyecto implementa un sistema RAG para consultar y analizar documentos oficiales de convocatorias públicas, especialmente del sector vitivinícola en España. Permite extraer, procesar y consultar información relevante de documentos PDF descargados desde APIs públicas.

## Estructura del Proyecto

- `src/` : Código fuente principal (scripts Python)
- `notebooks/` : Jupyter Notebooks para experimentación y análisis
- `data/` : Datos de entrada (Excel, texto extraído, etc.)
- `outputs/` : Resultados generados y documentos descargados
    - `documentos_convocatoria/` : PDFs descargados de las convocatorias
- `web/` : Aplicación web (frontend)
    - `project/` : Proyecto Vite + React + TypeScript

---

## Instrucciones para el Frontend (Web)

La aplicación web está ubicada en `web/project` y está construida con **Vite**, **React**, **TypeScript** y **TailwindCSS**.

### 1. Instalación de dependencias

Desde la raíz del proyecto, navega a la carpeta del frontend:
```bash
cd web/project
```
Instala las dependencias:
```bash
npm install
```

### 2. Ejecución en modo desarrollo

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```
Esto abrirá la aplicación en tu navegador, normalmente en [http://localhost:5173](http://localhost:5173).

### 3. Construcción para producción

Para generar la build de producción:
```bash
npm run build
```

### 4. Previsualización de la build

Para previsualizar la build de producción localmente:
```bash
npm run preview
```

### 5. Tecnologías utilizadas en el frontend
- **React**: Librería para interfaces de usuario.
- **Vite**: Herramienta de desarrollo rápida para proyectos web modernos.
- **TypeScript**: Superset de JavaScript tipado.
- **TailwindCSS**: Framework de utilidades CSS.

---

## Instrucciones para el Backend (Python)

1. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
2. Ejecuta el sistema RAG:
   ```bash
   python src/rag.py
   ```

---

## Conexión entre backend y frontend
- Si la web necesita comunicarse con el backend Python, asegúrate de exponer una API (por ejemplo, usando Flask o FastAPI en `src/` o `web/`).
- Actualiza los endpoints en el frontend según corresponda.

---

## Dependencias principales
- **Backend:**
  - transformers
  - sentence-transformers
  - torch
  - datasets
  - peft
  - trl
  - bitsandbytes
  - openpyxl
  - pandas
  - requests
  - pdfplumber
- **Frontend:**
  - React
  - Vite
  - TypeScript
  - TailwindCSS

---

## Autoría
Repositorio para el Trabajo Fin de Máster (TFM).
