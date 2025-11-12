'use client';
import React from 'react';
import { ModuleInstance } from '@/app/docs/models';
import NumericPad   from './modules/NumericPad';
import LogViewer    from './modules/LogViewer';
import SpectralConsole from './modules/SpectralConsole';
import PowerBypass     from './modules/PowerBypass';

const ModulePopup: React.FC<{ module?: ModuleInstance; onClose: () => void; }> = ({ module, onClose }) => {
  if (!module) return null;

  const render = () => {
    switch (module.type) {
      case 'numeric_pad':      return <NumericPad module={module} onClose={onClose} />;
      case 'log_viewer':       return <LogViewer  module={module} onClose={onClose} />;
      case 'spectral_console': return <SpectralConsole module={module} onClose={onClose} />;
      case 'power_bypass':     return <PowerBypass module={module} onClose={onClose} />;
      default:                 return <p>Module inconnu : {module.type}</p>;
    }
  };

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-xl text-white max-w-md w-[min(92vw,520px)]">
        {render()}
      </div>
    </div>
  );
};

export default ModulePopup;
