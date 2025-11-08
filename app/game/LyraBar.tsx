'use client';
import React, { useEffect, useState } from 'react';

const LyraBar: React.FC<{ message?: string }> = ({ message }) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [message]);
  if (!message || !visible) return null;
  return (
    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-center py-2 text-sm">
      <span className="text-blue-300">LYRA:</span> {message}
    </div>
  );
};

export default LyraBar;
