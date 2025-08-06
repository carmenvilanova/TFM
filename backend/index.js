const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Backend is running. Try /api/hello');
});

// Ruta GET de prueba
app.get('/api/hello', (req, res) => {
  res.json({ message: "Hola desde backend" });
});

// Ruta POST para procesamiento
app.post('/api/message', (req, res) => {
  const { content, phase } = req.body;

  if (phase === 'search') {
    const scriptPath = path.join(__dirname, 'archivos_py', 'test_parser.py'); // asegúrate que la ruta es correcta

    const python = spawn('python', [scriptPath, content], {
      cwd: path.join(__dirname, 'archivos_py'), // setea cwd por si hay import relativos
    });

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
        console.error("Error parseando JSON:", err);
        console.error("Salida Python:", data);
        res.status(500).json({ error: "Error parseando respuesta Python" });
      }
    });
  } else {
    const response = `Respuesta simulada para análisis de documento: "${content}"`;
    res.json({ reply: response });
  }
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
