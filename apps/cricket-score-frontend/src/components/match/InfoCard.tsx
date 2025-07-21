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
      className={`bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl p-6 shadow-2xl flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10 ${className}`}
    >
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 drop-shadow-md relative">
        <div className="h-1 w-5 bg-sky-400 rounded-full shadow-lg"></div>
        {title}
      </h2>
      <div className="flex-grow space-y-5 relative">
        {children}
      </div>
    </motion.div>
  )
);

InfoCard.displayName = 'InfoCard'; 