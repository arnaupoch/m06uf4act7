import React from 'react';


const DownloadHistory: React.FC<{ messages: string[] }> = ({ messages }) => {
  const downloadTxtFile = () => {
    const element = document.createElement('a');
    const file = new Blob([messages.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'historial.txt';
    document.body.appendChild(element);
    element.click();
  };

  return <button onClick={downloadTxtFile}>Descarregar l'historial</button>;
};

export default DownloadHistory;
