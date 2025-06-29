// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SignInButton } from "@clerk/nextjs";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/matches');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <section className="text-center">
        <h1 className="text-5xl font-extrabold text-foreground mb-4">Welcome to CricketScore</h1>
        <p className="text-xl text-secondary mb-8">
          Your ultimate source for real-time cricket scores and updates.
        </p>
      </section>
      
      {/* Clerk will automatically handle the authentication UI */}
      <div className="max-w-md mx-auto">
        <SignInButton mode="modal">
          <button className="w-full py-3 px-4 bg-primary text-white rounded-lg">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
}