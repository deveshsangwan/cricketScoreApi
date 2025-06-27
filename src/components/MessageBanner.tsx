'use client';

import { useState } from 'react';

export default function MessageBanner({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex justify-between items-center">
        <p className="text-blue-700">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="text-blue-500 hover:text-blue-700"
        >
          ×
        </button>
      </div>
    </div>
  );
}
