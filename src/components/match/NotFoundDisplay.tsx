import React from 'react';
import { motion } from 'framer-motion';

export const NotFoundDisplay: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-theme p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md text-center bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl p-8 shadow-3xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10"
    >
      <div className="w-16 h-16 mx-auto bg-muted/40 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-muted/60 relative shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-foreground drop-shadow-md">Match Not Found</h2>
      <p className="mt-2 text-muted-foreground">We couldn&apos;t find the details for this match.</p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shadow-xl hover:shadow-primary/30 focus:ring-2 focus:ring-primary/50 focus:outline-none backdrop-blur-sm border border-primary/20"
      >
        Go Back
      </button>
    </motion.div>
  </div>
); 