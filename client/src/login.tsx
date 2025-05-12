import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [salaId, setSalaId] = useState("s1");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [emisorId, setEmisorId] = useState("");

  const cargarHistorial = (sala: string) => {
    fetch(`http://localhost:4000/api/salas/${sala}/mensajes`)
      .then(res => res.json())
      .then(data => {
        const textos = data.map((m: any) => `[${m.timestamp}] ${m.emisorId}: ${m.contenido}`);
        setMessages(textos);
      });
  };

  useEffect(() => {
    if (!loggedIn) return;
    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => console.log("Conectado al WebSocket");
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    setSocket(ws);
    cargarHistorial(salaId);

    return () => ws.close();
  }, [loggedIn]);

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
        emisorId
      }),
    });
    setInput("");
  };

  const handleLogin = async () => {
    const res = await fetch("http://localhost:4000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });

    if (res.ok) {
      setEmisorId(username);
      setLoggedIn(true);
    } else {
      alert("Usuario o correo incorrectos");
    }
  };

  if (!loggedIn) {
    return (
      <div>
        <h2>Iniciar Sesión</h2>
        <input
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <button onClick={handleLogin}>Entrar</button>
      </div>
    );
  }

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

