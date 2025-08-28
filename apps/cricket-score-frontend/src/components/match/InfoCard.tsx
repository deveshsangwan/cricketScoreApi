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
      className={`glass-card p-6 flex flex-col ${className}`}
    >
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 relative">
        <div className="h-1 w-5 bg-gradient-to-r from-sky-400 to-purple-500 rounded-full"></div>
        {title}
      </h2>
      <div className="flex-grow space-y-5 relative">
        {children}
      </div>
    </motion.div>
  )
);

InfoCard.displayName = 'InfoCard'; 