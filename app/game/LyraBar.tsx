'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LyraBarProps {
  message?: string;
}

const LyraBar: React.FC<LyraBarProps> = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key="lyra-bar"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-8 left-1/2 z-[90] -translate-x-1/2"
        >
          <div
            className="backdrop-blur-md bg-black/60 border border-cyan-400/40 shadow-lg shadow-cyan-400/20
                       px-6 py-4 rounded-2xl max-w-3xl text-center text-cyan-100 font-medium
                       font-[Orbitron,monospace] tracking-wide text-lg"
            style={{
              textShadow: '0 0 10px rgba(0,255,255,0.35)',
            }}
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LyraBar;
