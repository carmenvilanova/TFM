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
const { spawn } = require('child_process');

app.post('/api/message', (req, res) => {
  const { content, phase } = req.body;

  if (phase === 'search') {
    const python = spawn('python3', ['test_parser.py', content]);

    let data = '';
    python.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    python.stderr.on('data', (error) => {
      console.error(`Error: ${error}`);
    });

    python.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: "Error ejecutando Python" });
      }

      try {
        const parsed = JSON.parse(data);
        res.json({ reply: parsed });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error parseando respuesta Python" });
      }
    });
  } else {
    // Puedes mantener la lógica de análisis u otra fase
    const response = `Respuesta simulada para análisis de documento: "${content}"`;
    res.json({ reply: response });
  }
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
