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
      className={`p-3 rounded-lg border-l-4 ${
        item.hasOver && item.over
          ? 'border-l-sky-400 bg-sky-950/20 border border-sky-900/30'
          : 'border-l-slate-600 bg-slate-800/20 border border-slate-700/30'
      }`}
    >
      {item.hasOver && item.over && (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Over {item.over}
          </span>
        </div>
      )}
      <p className={`text-sm leading-relaxed ${
        item.hasOver && item.over ? 'text-white' : 'text-slate-300'
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
      <div className={`bg-gradient-to-br from-[#142D3B] to-[#0f2230] border border-[#234354] rounded-2xl shadow-xl ${className}`}>
        <div className="p-6 border-b border-[#234354]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
            Live Commentary
          </h2>
        </div>
        <div className="h-[600px] flex items-center justify-center p-6 text-slate-400">
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
    <div className={`bg-gradient-to-br from-[#142D3B] to-[#0f2230] border border-[#234354] rounded-2xl shadow-xl ${className}`}>
      <div className="p-6 border-b border-[#234354]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
          Live Commentary
          <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
            {commentary.length} updates
          </span>
        </h2>
      </div>
      
      <div className="p-6 h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
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