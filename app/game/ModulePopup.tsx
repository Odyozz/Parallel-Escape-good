'use client';
import React from 'react';
import { ModuleInstance } from '@/app/docs/models';
import NumericPad from './modules/NumericPad';
import LogViewer from './modules/LogViewer';

const ModulePopup: React.FC<{
  module?: ModuleInstance;
  onClose: () => void;
}> = ({ module, onClose }) => {
  if (!module) return null;
  const render = () => {
    switch (module.type) {
      case 'numeric_pad': return <NumericPad module={module} onClose={onClose} />;
      case 'log_viewer':  return <LogViewer  module={module} onClose={onClose} />;
      default:            return <p>Module inconnu : {module.type}</p>;
    }
  };
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-xl text-white max-w-md">
        {render()}
      </div>
    </div>
  );
};

export default ModulePopup;
