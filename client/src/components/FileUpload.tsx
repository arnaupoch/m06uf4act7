import React, { useState } from 'react';


const FileUpload: React.FC<{ salaId: string }> = ({ salaId }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('salaId', salaId);

    await fetch('http://localhost:4000/api/upload', {
      method: 'POST',
      body: formData,
    });

    setFile(null);
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Pujar</button>
    </div>
  );
};

export default FileUpload;
