'use client';

import { useState } from 'react';

export default function MessageBanner({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-card/40 backdrop-blur-lg border-l-4 border-primary border-2 border-border/60 p-4 mb-6 rounded-lg shadow-xl relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-card/40 before:to-card/20 before:rounded-lg before:-z-10">
      <div className="flex justify-between items-center relative">
        <p className="text-foreground drop-shadow-md">{message}</p>
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
