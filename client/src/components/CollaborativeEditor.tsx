import React, { useEffect, useState } from 'react';

const CollaborativeEditor: React.FC = () => {
  const [contenido, setContenido] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'documento') {
        setContenido(data.contenido);
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nuevoContenido = e.target.value;
    setContenido(nuevoContenido);
    socket?.send(JSON.stringify({ type: 'documento', contenido: nuevoContenido }));
  };

  return (
    <div>
      <textarea value={contenido} onChange={handleChange} rows={10} cols={50} />
    </div>
  );
};

export default CollaborativeEditor;
