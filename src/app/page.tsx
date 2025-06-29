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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl text-slate-200 antialiased">
      <section className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-100 mb-4">Welcome to CricketScore</h1>
        <p className="text-xl text-slate-400 mb-8">
          Your ultimate source for real-time cricket scores and updates.
        </p>
      </section>
      
      {/* Clerk will automatically handle the authentication UI */}
      <div className="max-w-md mx-auto">
        <SignInButton mode="modal">
          <button className="w-full py-3 px-4 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
}