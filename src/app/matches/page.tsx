'use client';
import { Suspense } from 'react';
import LiveMatches from "@/components/LiveMatches";

function MatchesContent() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl text-slate-200 antialiased">
      <LiveMatches />
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense>
      <MatchesContent />
    </Suspense>
  );
}
