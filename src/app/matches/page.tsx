'use client';
import { Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import LiveMatches from '@/components/LiveMatches';
import { MatchesListSkeleton } from '@/components/ui/LoadingSkeleton';

function MatchesContent() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl text-foreground antialiased">
      <LiveMatches />
    </div>
  );
}

export default function MatchesPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <MatchesListSkeleton />;
  }

  if (!isSignedIn) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-theme">
      <Suspense fallback={<MatchesListSkeleton />}>
        <MatchesContent />
      </Suspense>
    </div>
  );
}
