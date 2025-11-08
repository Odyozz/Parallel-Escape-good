'use client';
import React, { useState } from 'react';
import { ModuleInstance } from '@/app/docs/models';

const NumericPad: React.FC<{
  module: ModuleInstance;
  onClose: () => void;
}> = ({ onClose }) => {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    alert(code === '593A' ? 'Code correct — énergie restaurée' : 'Erreur de protocole.');
    onClose();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold mb-2">Panneau du réacteur</h2>
      <input
        className="bg-gray-700 px-4 py-2 rounded text-center tracking-widest"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={4}
      />
      <button onClick={handleSubmit} className="mt-3 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
        Valider
      </button>
    </div>
  );
};

export default NumericPad;
