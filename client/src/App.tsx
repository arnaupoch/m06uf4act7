import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './App.css';


const App: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("http://localhost:4000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email }), // CAMBIO AQUI
    });

    if (res.ok) {
      navigate("/xats", { state: { username: nombre } });
    } else {
      alert("Usuario o correo incorrectos");
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
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
};

export default App;
