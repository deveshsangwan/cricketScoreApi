'use client';

import { useState } from 'react';

export default function MessageBanner({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-sky-900 border-l-4 border-sky-500 p-4 mb-6">
      <div className="flex justify-between items-center">
        <p className="text-sky-100">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="text-sky-400 hover:text-sky-200"
        >
          ×
        </button>
      </div>
    </div>
  );
}
