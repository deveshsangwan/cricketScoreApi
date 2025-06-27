'use client';
import { Suspense } from 'react';
import LiveMatches from "@/components/LiveMatches";

function MatchesContent() {
  return (
    <div className="container mx-auto px-4 py-8">
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
