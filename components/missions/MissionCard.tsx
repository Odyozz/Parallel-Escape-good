'use client';

import { useRouter } from 'next/navigation';
import Card from '../ui/Card';
import Button from '../ui/Button';

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

interface MissionCardProps {
  mission: Mission;
}

const MissionCard = ({ mission }: MissionCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (mission.status === 'available') {
      router.push(`/mission/${mission.id}`);
    }
  };

  const getDifficultyDots = (difficulty: string) => {
    const dots = [];
    const dotCount =
      difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;

    for (let i = 0; i < 3; i++) {
      dots.push(
        <div
          key={i}
          className={`difficulty-dot ${i < dotCount ? 'active' : ''}`}
        />
      );
    }

    return dots;
  };

  return (
    <Card
      className={`mission-card ${
        mission.status === 'available' ? 'clickable' : ''
      }`}
      onClick={handleCardClick}
    >
      <div
        className="mission-card-image"
        style={{ backgroundImage: `url(${mission.image})` }}
      />
      <div className="mission-card-content">
        <div className={`mission-status status-${mission.status}`}>
          {mission.status === 'available' ? 'Disponible' : 'Bientôt disponible'}
        </div>
        <h3>{mission.title}</h3>
        <p>{mission.shortDescription}</p>

        <div className="mission-details">
          <div className="mission-detail-item">
            <span>⏱️</span>
            <span>{mission.duration}</span>
          </div>
          <div className="mission-detail-item">
            <span>👥</span>
            <span>{mission.players}</span>
          </div>
          <div
            className={`mission-difficulty difficulty-${mission.difficulty}`}
          >
            {getDifficultyDots(mission.difficulty)}
          </div>
        </div>

        <Button
          variant={mission.status === 'available' ? 'primary' : 'secondary'}
          disabled={mission.status !== 'available'}
        >
          {mission.status === 'available'
            ? 'Entrer dans la salle'
            : 'Prochainement'}
        </Button>
      </div>

      <style jsx>{`
        .mission-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .mission-card.clickable {
          cursor: pointer;
        }
        
        .mission-card-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          margin: -30px -30px 20px -30px;
          border-radius: 10px 10px 0 0;
        }
        
        .mission-card-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        
        .mission-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        
        .status-available {
          background: rgba(0, 212, 102, 0.2);
          color: var(--success-color);
        }
        
        .status-coming-soon {
          background: rgba(255, 149, 0, 0.2);
          color: var(--warning-color);
        }
        
        .mission-details {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .mission-detail-item {
          display: flex;
          align-items: center;
        }
        
        .mission-detail-item span:first-child {
          margin-right: 5px;
        }
        
        .mission-difficulty {
          display: flex;
          align-items: center;
        }
        
        .difficulty-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 3px;
          background: var(--border-color);
        }
        
        .difficulty-dot.active {
          background: var(--warning-color);
        }
        
        .difficulty-easy .difficulty-dot.active {
          background: var(--success-color);
        }
        
        .difficulty-medium .difficulty-dot.active {
          background: var(--warning-color);
        }
        
        .difficulty-hard .difficulty-dot.active {
          background: var(--danger-color);
        }
        
        .btn {
          margin-top: auto;
        }
      `}</style>
    </Card>
  );
};

export default MissionCard;
