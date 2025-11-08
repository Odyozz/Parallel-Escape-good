'use client';
import React from 'react';
import { ModuleInstance } from '@/app/docs/models';

const LogViewer: React.FC<{
  module: ModuleInstance;
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Terminal de logs</h2>
      <pre className="bg-gray-700 p-3 rounded text-sm text-green-300">
{`[LOG-2374]
Flux instable détecté.
Protocole B7 = 593A.
Réacteur auxiliaire requis.`}
      </pre>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
        Fermer
      </button>
    </div>
  );
};

export default LogViewer;
