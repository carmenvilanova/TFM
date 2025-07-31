const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta raíz para evitar "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Backend is running. Try /api/hello');
});

// Ruta GET de prueba
app.get('/api/hello', (req, res) => {
  res.json({ message: "Hola desde backend" });
});

// Ruta POST de procesamiento
app.post('/api/message', (req, res) => {
  const { content, phase } = req.body;

  const response = phase === 'search'
    ? `Respuesta simulada de búsqueda para: "${content}"`
    : `Respuesta simulada para análisis de documento: "${content}"`;

  res.json({ reply: response });
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
