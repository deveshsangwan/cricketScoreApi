import React from 'react';
import { motion } from 'framer-motion';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const InfoCard = React.memo<InfoCardProps>(
  ({ title, children, className = '' }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      layout={false}
      className={`bg-gradient-to-br from-[#142D3B] to-[#0f2230] border border-[#234354] rounded-2xl p-6 shadow-xl flex flex-col ${className}`}
    >
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
        {title}
      </h2>
      <div className="flex-grow space-y-5">
        {children}
      </div>
    </motion.div>
  )
);

InfoCard.displayName = 'InfoCard'; 