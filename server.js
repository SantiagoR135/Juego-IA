const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Asegurar existencia del directorio data y archivo scores.json
async function ensureScoresFile() {
  try {
    const dataDir = path.join(__dirname, 'data');
    await fs.mkdir(dataDir, { recursive: true });
    try {
      await fs.access(SCORES_FILE);
    } catch {
      await fs.writeFile(SCORES_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error inicializando almacenamiento de scores:', error);
  }
}

// Rutas de API

// GET /api/scores - Obtener Top 10 puntuaciones
app.get('/api/scores', async (req, res) => {
  try {
    await ensureScoresFile();
    const rawData = await fs.readFile(SCORES_FILE, 'utf-8');
    let scores = [];
    try {
      scores = JSON.parse(rawData);
    } catch (parseErr) {
      scores = [];
    }

    // Ordenar de mayor a menor y tomar el top 10
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 10);

    return res.status(200).json({
      success: true,
      data: topScores
    });
  } catch (error) {
    console.error('Error al leer puntuaciones:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener las puntuaciones'
    });
  }
});

// POST /api/scores - Guardar nueva puntuación con validación estricta
app.post('/api/scores', async (req, res) => {
  try {
    const { name, score, level } = req.body;

    // Validaciones
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del jugador es requerido y debe ser una cadena válida.'
      });
    }

    const sanitizedName = name.trim().toUpperCase().slice(0, 15);

    const parsedScore = parseInt(score, 10);
    if (isNaN(parsedScore) || parsedScore < 0) {
      return res.status(400).json({
        success: false,
        error: 'El puntaje debe ser un número entero no negativo.'
      });
    }

    const parsedLevel = parseInt(level, 10);
    if (isNaN(parsedLevel) || parsedLevel < 1) {
      return res.status(400).json({
        success: false,
        error: 'El nivel alcanzado debe ser un número entero positivo mayor a 0.'
      });
    }

    await ensureScoresFile();
    const rawData = await fs.readFile(SCORES_FILE, 'utf-8');
    let scores = [];
    try {
      scores = JSON.parse(rawData);
    } catch (e) {
      scores = [];
    }

    const newScoreEntry = {
      name: sanitizedName,
      score: parsedScore,
      level: parsedLevel,
      date: new Date().toISOString()
    };

    scores.push(newScoreEntry);

    // Guardar ordenado y limitar a los mejores 100 récords históricos
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 100);

    await fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2), 'utf-8');

    return res.status(201).json({
      success: true,
      message: 'Puntuación registrada exitosamente',
      data: newScoreEntry
    });
  } catch (error) {
    console.error('Error al guardar puntuación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al guardar la puntuación'
    });
  }
});

// Servidor escuchando
ensureScoresFile().then(() => {
  app.listen(PORT, () => {
    console.log(`[Cyber Commando 2D Server] Ejecutándose en http://localhost:${PORT}`);
  });
});
