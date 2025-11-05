// components/ui/Toast.tsx
'use client';

import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type, duration = 3000, onClose }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'info':
      default:
        return 'toast-info';
    }
  };

  return (
    <div
      className={`toast ${getToastClass()} ${visible ? 'visible' : 'hidden'}`}
    >
      <p>{message}</p>
      <button
        className="toast-close"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
      >
        &times;
      </button>

      <style jsx>{`
        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 300px;
          max-width: 500px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          transform: translateY(0);
          opacity: 1;
          transition: all 0.3s ease;
        }

        .toast.hidden {
          transform: translateY(20px);
          opacity: 0;
        }

        .toast-success {
          background-color: var(--success-color);
        }

        .toast-error {
          background-color: var(--danger-color);
        }

        .toast-info {
          background-color: var(--accent-color);
        }

        .toast p {
          margin: 0;
          flex-grow: 1;
        }

        .toast-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          margin-left: 15px;
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .toast-close:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Toast;
