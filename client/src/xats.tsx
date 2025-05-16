import React, { useEffect, useState } from "react";
import FileUpload from './components/FileUpload';
import DownloadHistory from './components/DownloadHistory';
import CollaborativeEditor from './components/CollaborativeEditor';

const Xats: React.FC = () => {
  const [salaId, setSalaId] = useState("s1");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    cargarHistorial(salaId);
    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => console.log("Conectado al WebSocket");
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  // Cambiar sala y cargar su historial
  const cambiarSala = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaSala = e.target.value;
    setSalaId(nuevaSala);
    cargarHistorial(nuevaSala);
  };

  // Cargar historial desde el backend REST
  const cargarHistorial = (sala: string) => {
    fetch(`http://localhost:4000/api/salas/${sala}/mensajes`)
      .then((res) => res.json())
      .then((data) => {
        const textos = data.map(
          (m: any) => `[${m.timestamp}] ${m.emisorId}: ${m.contenido}`
        );
        setMessages(textos);
      });
  };

  // Enviar mensaje vía REST
  const sendMessage = async () => {
    if (!input.trim()) return;

    await fetch("http://localhost:4000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        salaId,
        emisorId: "u1", // ID de usuario fijo
      }),
    });

    setInput("");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>UF4: Xat amb WebSocket + funcionalitats</h1>

      {/* Selector de salas */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="sala">Sala: </label>
        <select id="sala" value={salaId} onChange={cambiarSala}>
          <option value="s1">Sala del Profesor</option>
          <option value="s2">Sala de Alumnos</option>
          <option value="s3">Privado Ana - Luis</option>
        </select>
      </div>

      {/* Input y envío de mensajes */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje"
        />
        <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
          Envia
        </button>
      </div>

      {/* Área de mensajes */}
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px", maxHeight: "200px", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <p>Sense missatges en aquesta sala.</p>
        ) : (
          messages.map((msg, i) => <p key={i}>{msg}</p>)
        )}
      </div>
      

      {/* Funcionalidades adicionales */}
      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
        <div>
          <h2>Pujada d'arxius</h2>
          <FileUpload salaId={salaId} />
        </div>

        <div>
          <h2>Descarrega l'historial</h2>
          <DownloadHistory messages={messages} />
        </div>

        <div>
          <h2>Document col·laboratiu</h2>
          <CollaborativeEditor />
        </div>
      </div>
    </div>
  );
};

export default Xats;