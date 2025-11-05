'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';

interface Mission {
  id: string;
  title: string;
  description: string;
}

interface MissionModalProps {
  mission: Mission;
  onClose: () => void;
}

const MissionModal = ({ mission, onClose }: MissionModalProps) => {
  const [activeTab, setActiveTab] = useState('intro');

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="mission-modal-header">
        <h2>{mission.title}</h2>
        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'intro' ? 'active' : ''}`}
            onClick={() => setActiveTab('intro')}
          >
            Introduction
          </button>
          <button
            className={`tab ${activeTab === 'atmosphere' ? 'active' : ''}`}
            onClick={() => setActiveTab('atmosphere')}
          >
            Ambiance
          </button>
          <button
            className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            Défis
          </button>
        </div>
      </div>

      <div className="modal-body">
        {activeTab === 'intro' && (
          <div className="tab-content">
            <h3>Introduction</h3>
            <p>
              Bienvenue dans {mission.title}. Cette mission vous plongera dans
              un environnement immersif où la communication et la logique seront
              vos meilleurs atouts.
            </p>
            <p>
              Préparez-vous à explorer des lieux fascinants, résoudre des
              énigmes complexes et travailler en équipe pour atteindre votre
              objectif avant qu'il ne soit trop tard.
            </p>
            <div className="audio-player">
              <p>Écoutez l'introduction vocale par LYRA :</p>
              <button className="btn btn-secondary">▶️ Jouer l'audio</button>
            </div>
          </div>
        )}

        {activeTab === 'atmosphere' && (
          <div className="tab-content">
            <h3>Ambiance</h3>
            <p>
              L'atmosphère de {mission.title} a été soigneusement conçue pour
              vous immerger complètement dans cet univers.
            </p>
            <p>
              Les effets sonores, l'éclairage et les détails visuels créent une
              expérience captivante qui vous fera oublier que vous êtes derrière
              un écran.
            </p>
            <div className="atmosphere-gallery">
              <div className="gallery-item">
                <div className="gallery-placeholder"></div>
                <p>Environnement principal</p>
              </div>
              <div className="gallery-item">
                <div className="gallery-placeholder"></div>
                <p>Zone de puzzle</p>
              </div>
              <div className="gallery-item">
                <div className="gallery-placeholder"></div>
                <p>Salle finale</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="tab-content">
            <h3>Défis</h3>
            <p>
              {mission.title} présente plusieurs défis qui testeront différentes
              compétences :
            </p>
            <ul>
              <li>Résolution d'énigmes logiques</li>
              <li>Communication et coordination d'équipe</li>
              <li>Observation et attention aux détails</li>
              <li>Gestion du temps et des priorités</li>
            </ul>
            <p>
              Chaque salle offre des défis uniques qui contribuent à l'histoire
              globale de la mission.
            </p>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn" onClick={onClose}>
          Fermer
        </button>
      </div>

      <style jsx>{`
        .mission-modal-header {
          margin-bottom: 20px;
        }
        
        .modal-tabs {
          display: flex;
          margin-top: 20px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .tab {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 10px 20px;
          font-family: 'Orbitron', monospace;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .tab::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        
        .tab.active {
          color: var(--accent-color);
        }
        
        .tab.active::after {
          transform: scaleX(1);
        }
        
        .tab-content {
          min-height: 300px;
        }
        
        .tab-content h3 {
          margin-bottom: 15px;
          color: var(--accent-color);
        }
        
        .tab-content p {
          margin-bottom: 15px;
        }
        
        .tab-content ul {
          margin-left: 20px;
          margin-bottom: 15px;
        }
        
        .tab-content li {
          margin-bottom: 5px;
        }
        
        .audio-player {
          margin-top: 20px;
          padding: 15px;
          background: var(--secondary-bg);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        
        .atmosphere-gallery {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        
        .gallery-item {
          flex: 1;
          text-align: center;
        }
        
        .gallery-placeholder {
          height: 120px;
          background: var(--secondary-bg);
          border-radius: 8px;
          border: 1px solid var(--border-color);
          margin-bottom: 10px;
        }
        
        .gallery-item p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .modal-footer {
          margin-top: 20px;
          text-align: right;
        }
        
        @media (max-width: 768px) {
          .modal-tabs {
            overflow-x: auto;
          }
          
          .atmosphere-gallery {
            flex-direction: column;
          }
        }
      `}</style>
    </Modal>
  );
};

export default MissionModal;
