// components/puzzles/CircuitPuzzle.tsx

import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext'; // 1. On utilise le hook mis à jour

interface Node {
  id: string;
  x: number;
  y: number;
}

export const CircuitPuzzle: React.FC = () => {
  const { sendIntent, modules, currentRoom } = useGame(); // 1. On récupère les bonnes données du contexte
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'A', x: 50, y: 50 },
    { id: 'B', x: 200, y: 50 },
    { id: 'C', x: 125, y: 150 },
    { id: 'D', x: 50, y: 200 }, // Ajoutons plus de nœuds pour le rendre un peu plus complexe
    { id: 'E', x: 200, y: 200 },
    { id: 'F', x: 350, y: 125 },
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connections, setConnections] = useState<string[]>([]); // On gère les connexions séparément

  // 2. Vérifier si le puzzle est résolu depuis l'état global
  const puzzleState = modules?.energy?.puzzles?.ACT1_ENERGY_CIRCUITS;
  const isSolved = puzzleState?.state === 'solved';
  const isLocked = puzzleState?.state === 'locked';

  // Le puzzle n'est jouable que si le joueur est dans la bonne salle et que le puzzle n'est pas résolu
  const isPlayable = currentRoom === 'energy' && !isSolved;

  const handleNodeClick = (nodeId: string) => {
    if (!isPlayable) return;

    if (!selectedNode) {
      setSelectedNode(nodeId);
    } else if (selectedNode === nodeId) {
      setSelectedNode(null);
    } else {
      // Ajouter ou supprimer une connexion
      const newConnection = [selectedNode, nodeId].sort().join('-');
      setConnections(prev => {
        if (prev.includes(newConnection)) {
          return prev.filter(c => c !== newConnection);
        } else {
          return [...prev, newConnection];
        }
      });
      setSelectedNode(null);
    }
  };

  const handleSubmit = async () => {
    if (!isPlayable) return;

    // 3. Le 'kind' doit correspondre à la clé dans notre PuzzleCatalog
    const kind = 'ACT1_ENERGY_CIRCUITS';
    
    // 4. Le payload doit correspondre à ce que la `successCondition` attend.
    // Nous allons envoyer les connexions, c'est plus logique.
    const payload = { connections };

    const result = await sendIntent(kind, payload);

    if (result.ok) {
      console.log('Puzzle résolu !');
      // L'UI se mettra à jour automatiquement via le listener dans GameContext
    } else {
      console.error('Erreur puzzle:', result.errors);
      // Ici, on pourrait afficher une erreur à l'utilisateur
    }
  };

  return (
    <div className="puzzle-container">
      <h3>Reliez les 3 nœuds d'énergie</h3>
      {isLocked && <p className="puzzle-locked-message">Ce puzzle n'est pas encore accessible.</p>}
      
      <div className="circuit-container">
        <svg width="400" height="250" className="circuit-svg">
          {/* Dessiner les connexions */}
          {connections.map(connection => {
            const [nodeId1, nodeId2] = connection.split('-');
            const node1 = nodes.find(n => n.id === nodeId1);
            const node2 = nodes.find(n => n.id === nodeId2);
            if (!node1 || !node2) return null;
            
            return (
              <line
                key={connection}
                x1={node1.x}
                y1={node1.y}
                x2={node2.x}
                y2={node2.y}
                stroke="#00ffff"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Dessiner les nœuds */}
          {nodes.map(node => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r="20"
              fill={selectedNode === node.id ? "#ffff00" : isPlayable ? "#0088ff" : "#555555"}
              stroke="#ffffff"
              strokeWidth="2"
              onClick={() => handleNodeClick(node.id)}
              className={`circuit-node ${isPlayable ? 'clickable' : ''}`}
            />
          ))}
          
          {/* Labels des nœuds */}
          {nodes.map(node => (
            <text
              key={`label-${node.id}`}
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="16"
              pointerEvents="none"
            >
              {node.id}
            </text>
          ))}
        </svg>
      </div>
      
      <button 
        onClick={handleSubmit} 
        disabled={!isPlayable || connections.length === 0}
        className={`puzzle-submit ${isSolved ? 'solved' : ''}`}
      >
        {isSolved ? 'Résolu' : 'Valider'}
      </button>

      <style jsx>{`
        .puzzle-container {
          padding: 20px;
          background: rgba(0, 20, 40, 0.8);
          border-radius: 8px;
          border: 1px solid var(--accent-color);
        }
        .puzzle-locked-message {
          color: var(--warning-color);
          font-style: italic;
        }
        .circuit-container {
          margin: 20px 0;
        }
        .circuit-node.clickable {
          cursor: pointer;
        }
        .circuit-node.clickable:hover {
          filter: brightness(1.2);
        }
        .puzzle-submit {
          padding: 10px 20px;
          background: var(--accent-color);
          color: var(--text-primary);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Orbitron', sans-serif;
        }
        .puzzle-submit:disabled {
          background: #555;
          cursor: not-allowed;
        }
        .puzzle-submit.solved {
          background: var(--success-color);
        }
      `}</style>
    </div>
  );
};