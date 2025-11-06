'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import MissionCard from '@/components/missions/MissionCard';

interface Mission {
  id: string;
  title: string;
  shortDescription: string;
  image: string;
  status: 'available' | 'coming-soon';
  duration: string;
  players: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function HubPageClient() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      const missionsData: Mission[] = [
        {
          id: 'cryostation9',
          title: 'CryoStation 9',
          shortDescription: 'Le vaisseau dérive vers une planète inconnue.',
          image: '/images/missions/cryostation.png',
          status: 'available',
          duration: '30 min',
          players: '2-4',
          difficulty: 'medium',
        },
        {
          id: 'temple-echoes',
          title: 'Temple des Échos',
          shortDescription:
            'Explorez une jungle perdue où les voix du passé guident votre chemin.',
          image: '/images/missions/temple.png',
          status: 'coming-soon',
          duration: '45 min',
          players: '3-5',
          difficulty: 'hard',
        },
        {
          id: 'veiled-citadel',
          title: 'Citadelle Voilée',
          shortDescription:
            "Décryptez les secrets d'une forteresse oubliée dans les brumes du temps.",
          image: '/images/missions/citadel.png',
          status: 'coming-soon',
          duration: '40 min',
          players: '2-4',
          difficulty: 'medium',
        },
      ];

      setMissions(missionsData);
      setLoading(false);
    };

    fetchMissions();
  }, []);

  return (
    <div className="hub-page">
      <Header />

      <section className="hero section">
        <div className="container">
          <div className="hero-content">
            <h1>Hub des missions</h1>
            <p>Choisissez votre mission.</p>
            <p>Une équipe, trois salles, trente minutes pour survivre.</p>
          </div>
        </div>
      </section>

      <section className="missions section">
        <div className="container">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="missions-grid grid grid-3">
              {missions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .hub-page {
          padding-top: 80px;
        }
        .hero {
          text-align: center;
          padding: 60px 0;
        }
        .hero-content h1 {
          margin-bottom: 20px;
        }
        .hero-content p {
          font-size: 1.2rem;
          margin-bottom: 10px;
        }
        .missions {
          padding-bottom: 80px;
        }
        .missions-grid {
          margin-top: 40px;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
