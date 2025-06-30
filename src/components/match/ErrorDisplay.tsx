import React from 'react';
import { motion } from 'framer-motion';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md text-center bg-slate-800/60 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl"
    >
      <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-white">Connection Error</h2>
      <p className="mt-2 text-slate-300">{error}</p>
      <div className="mt-6 flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-sky-500/25 focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
        >
          Try Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-600 transition-all focus:ring-2 focus:ring-slate-500/50 focus:outline-none"
        >
          Go Back
        </button>
      </div>
    </motion.div>
  </div>
); 