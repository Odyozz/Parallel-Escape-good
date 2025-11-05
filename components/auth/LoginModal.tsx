// components/auth/LoginModal.tsx
'use client';

import { useState } from 'react';
import {
  signInWithGoogle,
  signInAnonymouslyHandler,
} from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal = ({ onClose }: LoginModalProps) => {
  const [loading, setLoading] = useState(false);
  // On ne récupère que currentUser, pas de setCurrentUser
  const { user } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // La connexion a réussi, le contexte va mettre à jour `currentUser` automatiquement
      onClose();
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      // Vous pourriez afficher un message d'erreur ici à l'avenir
    } finally {
      // Le bloc finally s'exécute toujours, succès ou échec
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      await signInAnonymouslyHandler();
      // La connexion a réussi, le contexte va mettre à jour `currentUser` automatiquement
      onClose();
    } catch (error) {
      console.error('Erreur lors de la connexion anonyme:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Connexion</h2>
        <p>Rejoignez l'aventure Parallel Escape</p>

        <div className="login-options">
          <Button
            variant="primary"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Connexion avec Google'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleAnonymousSignIn}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Connexion Anonyme'}
          </Button>
        </div>

        <p className="login-note">
          La connexion anonyme vous permet de jouer sans créer de compte. Vos
          progrès ne seront pas sauvegardés entre les sessions.
        </p>
      </div>

      <style jsx>{`
        .login-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin: 30px 0;
        }

        .login-note {
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-align: center;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default LoginModal;
