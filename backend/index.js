const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: "Hola desde backend" });
});

app.post('/api/message', (req, res) => {
  const { content, phase } = req.body;

  const response = phase === 'search'
    ? `Respuesta simulada de búsqueda para: "${content}"`
    : `Respuesta simulada para análisis de documento: "${content}"`;

  res.json({ reply: response });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
