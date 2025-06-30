import React from 'react';
import { motion } from 'framer-motion';

export const NotFoundDisplay: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md text-center bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl"
    >
      <div className="w-16 h-16 mx-auto bg-slate-700/30 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-white">Match Not Found</h2>
      <p className="mt-2 text-slate-300">We couldn't find the details for this match.</p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-sky-500/25 focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
      >
        Go Back
      </button>
    </motion.div>
  </div>
); 