'use client';
import React, { useState } from 'react';
import { ModuleInstance } from '@/app/docs/models';

const SpectralConsole: React.FC<{ module: ModuleInstance; onClose: () => void }> = ({ onClose }) => {
  const [filter, setFilter] = useState<'A'|'B'|'C'|'OFF'>('OFF');

  return (
    <div className="text-white space-y-3">
      <h2 className="text-xl font-bold">Console Spectrale</h2>
      <p className="text-sm text-gray-300">
        Un balayage révèle des résidus énergétiques sur certaines fréquences.
      </p>

      <div className="flex gap-2">
        {(['OFF','A','B','C'] as const).map((f)=>(
          <button
            key={f}
            onClick={()=>setFilter(f)}
            className={`px-3 py-1 rounded ${filter===f?'bg-blue-600':'bg-gray-700 hover:bg-gray-600'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-black/40 rounded p-3 min-h-[80px] border border-gray-700">
        {filter==='OFF' && <p className="text-gray-400">Aucun signal filtré.</p>}
        {filter==='A'   && (
          <pre className="text-green-300 text-sm">{`[TRAME-A]  ..—.–.—. .- - .... -.-.
Indice: Les connecteurs « ALPHA » et « DELTA » semblent actifs.`}</pre>
        )}
        {filter==='B'   && (
          <pre className="text-cyan-300 text-sm">{`[TRAME-B]  .- ..— —.. — .–
Indice: Le relais secondaire laisse passer l'énergie quand la pression est stabilisée.`}</pre>
        )}
        {filter==='C'   && (
          <pre className="text-amber-200 text-sm">{`[TRAME-C]  —.. –.— – –.. .—
Indice: Le code B7 se valide après rétablissement de la ligne auxiliaire.`}</pre>
        )}
      </div>

      <div className="text-right">
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
          Fermer
        </button>
      </div>
    </div>
  );
};

export default SpectralConsole;
