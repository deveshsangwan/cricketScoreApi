'use client';

import { useState } from 'react';

export default function MessageBanner({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="alert alert-info mb-6">
      <div className="flex justify-between items-center relative">
        <p className="text-foreground">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="btn btn-ghost w-7 h-7 p-0 rounded-full"
        >
          ×
        </button>
      </div>
    </div>
  );
}
