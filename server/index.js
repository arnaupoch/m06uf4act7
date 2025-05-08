const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 4000;
const dbPath = path.join(__dirname, "database.json");

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

// POST /api/message → guarda el mensaje y lo envía por WebSocket
app.post("/api/message", (req, res) => {
  const { message, salaId = "s1", emisorId = "u1" } = req.body;
  if (!message) return res.status(400).json({ error: "Mensaje vacío" });

  const nuevo = {
    id: "m" + Date.now(),
    salaId,
    emisorId,
    contenido: message,
    timestamp: new Date().toISOString()
  };

  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error al leer la base de datos" });

    const db = JSON.parse(data);
    db.mensajes.push(nuevo);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error al guardar el mensaje" });

      // Emitir a todos los clientes conectados
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      res.json({ sent: true });
    });
  });
});

// GET /api/salas/:salaId/mensajes → historial de mensajes por sala
app.get("/api/salas/:salaId/mensajes", (req, res) => {
  const salaId = req.params.salaId;

  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error al leer la base de datos" });

    const db = JSON.parse(data);
    const mensajes = db.mensajes.filter(m => m.salaId === salaId);
    res.json(mensajes);
  });
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor actiu!");
});

server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
