'use client';

import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/firebase';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile = ({ onClose }: UserProfileProps) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    auth.signOut();
    onClose();
  };

  const goToProfile = () => {
    router.push('/profile');
    onClose();
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user?.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : 'A'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{user?.displayName || 'Joueur Anonyme'}</h2>
            <p>{user?.email || 'Connexion anonyme'}</p>
          </div>
        </div>

        <div className="profile-actions">
          <Button onClick={goToProfile}>Voir mon profil</Button>
          <Button variant="secondary" onClick={handleSignOut}>
            Déconnexion
          </Button>
        </div>
      </div>

      <style jsx>{`
        .profile-header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 20px;
          border: 2px solid var(--accent-color);
        }
        
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--secondary-bg);
          color: var(--accent-color);
          font-weight: 700;
          font-size: 2rem;
        }
        
        .profile-info h2 {
          margin-bottom: 5px;
        }
        
        .profile-info p {
          color: var(--text-secondary);
        }
        
        .profile-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
