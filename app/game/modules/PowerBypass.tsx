'use client';
import React, { useMemo, useState } from 'react';
import { ModuleInstance } from '@/app/docs/models';

/**
 * Mini-puzzle « shunt d’alimentation » :
 *  - 4 segments (A,B,C,D). Il faut créer un chemin continu ENTRÉE → SORTIE
 *  - Chaque bouton toggle un segment. Solution: A + C + D (B doit rester OFF)
 */
const PowerBypass: React.FC<{ module: ModuleInstance; onClose: () => void }> = ({ onClose }) => {
  const [A, setA] = useState(false);
  const [B, setB] = useState(false);
  const [C, setC] = useState(false);
  const [D, setD] = useState(false);

  const ok = useMemo(()=> A && !B && C && D, [A,B,C,D]);

  return (
    <div className="text-white space-y-3">
      <h2 className="text-xl font-bold">Shunt d'alimentation</h2>
      <p className="text-sm text-gray-300">Crée un chemin stable jusqu'au relais auxiliaire.</p>

      <div className="grid grid-cols-4 gap-2">
        <button onClick={()=>setA(v=>!v)} className={`px-3 py-2 rounded ${A?'bg-green-600':'bg-gray-700'}`}>Segment A</button>
        <button onClick={()=>setB(v=>!v)} className={`px-3 py-2 rounded ${B?'bg-red-600':'bg-gray-700'}`}>Segment B</button>
        <button onClick={()=>setC(v=>!v)} className={`px-3 py-2 rounded ${C?'bg-green-600':'bg-gray-700'}`}>Segment C</button>
        <button onClick={()=>setD(v=>!v)} className={`px-3 py-2 rounded ${D?'bg-green-600':'bg-gray-700'}`}>Segment D</button>
      </div>

      <div className={`p-3 rounded border ${ok?'border-green-400 bg-green-900/30':'border-gray-600 bg-gray-700/30'}`}>
        {ok
          ? <p className="text-green-300 text-sm">Chemin stable établi. Le relais secondaire peut maintenant accepter le protocole B7.</p>
          : <p className="text-gray-300 text-sm">Chemin incomplet / instable.</p>}
      </div>

      <div className="text-right">
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
          Fermer
        </button>
      </div>
    </div>
  );
};

export default PowerBypass;
