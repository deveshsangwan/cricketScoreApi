'use client';

import { useState } from 'react';

export default function MessageBanner({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="glass-card border-l-4 border-l-sky-500 p-4 mb-6 rounded-lg">
      <div className="flex justify-between items-center relative">
        <p className="text-foreground">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-muted/30 rounded-full w-6 h-6 flex items-center justify-center border border-muted/50 backdrop-blur-sm"
        >
          ×
        </button>
      </div>
    </div>
  );
}
