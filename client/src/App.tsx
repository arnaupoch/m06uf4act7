import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [salaId, setSalaId] = useState("s1");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  // Cargar historial de la sala seleccionada
  const cargarHistorial = (sala: string) => {
    fetch(`http://localhost:4000/api/salas/${sala}/mensajes`)
      .then(res => res.json())
      .then(data => {
        const textos = data.map((m: any) => `[${m.timestamp}] ${m.emisorId}: ${m.contenido}`);
        setMessages(textos);
      });
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => console.log("Conectado al WebSocket");
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    setSocket(ws);
    cargarHistorial(salaId);

    return () => ws.close();
  }, []);

  const cambiarSala = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nueva = e.target.value;
    setSalaId(nueva);
    cargarHistorial(nueva);
  };

  const sendMessage = async () => {
    if (!input) return;
    await fetch("http://localhost:4000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        salaId,
        emisorId: "u1" // Usuario fijo por ahora
      }),
    });
    setInput("");
  };

  return (
    <div>
      <h1>Chat REST → WebSocket</h1>

      <label htmlFor="sala">Selecciona una sala:</label>
      <select id="sala" value={salaId} onChange={cambiarSala}>
        <option value="s1">Sala del Profesor</option>
        <option value="s2">Sala de Alumnos</option>
        <option value="s3">Privado Ana - Luis</option>
      </select>

      <div style={{ marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje"
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default App;
