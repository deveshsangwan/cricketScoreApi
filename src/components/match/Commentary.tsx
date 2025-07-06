'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CommentaryItem {
  commentary: string;
  hasOver: boolean;
  over?: string;
}

interface CommentaryProps {
  commentary: CommentaryItem[];
  className?: string;
}

const CommentaryItem = React.memo<{ item: CommentaryItem; index: number }>(
  ({ item, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={`p-3 rounded-lg border-l-4 backdrop-blur-lg ${
        item.hasOver && item.over
          ? 'border-l-sky-500 bg-sky-100/60 dark:bg-sky-950/40 border-2 border-sky-300/60 dark:border-sky-900/60'
          : 'border-l-muted bg-card/40 border-2 border-border/60'
      }`}
    >
      {item.hasOver && item.over && (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-200/80 dark:bg-sky-500/30 text-sky-700 dark:text-sky-300 border-2 border-sky-400/50 dark:border-sky-500/50 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Over {item.over}
          </span>
        </div>
      )}
      <p className={`text-sm leading-relaxed ${
        item.hasOver && item.over ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        {item.commentary}
      </p>
    </motion.div>
  )
);

CommentaryItem.displayName = 'CommentaryItem';

export const Commentary: React.FC<CommentaryProps> = React.memo(({ commentary, className = '' }) => {
  if (!commentary || commentary.length === 0) {
    return (
      <div className={`bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10 ${className}`}>
        <div className="p-6 border-b border-border/60 relative">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2 drop-shadow-md">
            <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
            Live Commentary
          </h2>
        </div>
        <div className="h-[600px] flex items-center justify-center p-6 text-muted-foreground relative">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No commentary available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10 ${className}`}>
      <div className="p-6 border-b border-border/60 relative">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 drop-shadow-md">
          <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
          Live Commentary
          <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted/40 backdrop-blur-sm px-2 py-1 rounded-full border-2 border-muted/60">
            {commentary.length} updates
          </span>
        </h2>
      </div>
      
      <div className="p-6 h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground hover:scrollbar-thumb-foreground relative">
        <div className="space-y-4">
          {commentary.map((item, index) => (
            <CommentaryItem key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
});

Commentary.displayName = 'Commentary'; 