import React from 'react';
import { motion } from 'framer-motion';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-theme p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md text-center bg-card/50 backdrop-blur-lg border-2 border-red-500/60 rounded-2xl p-8 shadow-3xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10"
    >
      <div className="w-16 h-16 mx-auto bg-red-500/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-red-500/50 relative shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-foreground drop-shadow-md">Connection Error</h2>
      <p className="mt-2 text-muted-foreground">{error}</p>
      <div className="mt-6 flex gap-3 justify-center relative">
        <button
          onClick={onRetry}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shadow-xl hover:shadow-primary/30 focus:ring-2 focus:ring-primary/50 focus:outline-none backdrop-blur-sm border border-primary/20"
        >
          Try Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-muted/40 text-muted-foreground font-semibold px-5 py-2.5 rounded-lg hover:bg-muted/60 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none backdrop-blur-sm border-2 border-muted/60"
        >
          Go Back
        </button>
      </div>
    </motion.div>
  </div>
); 