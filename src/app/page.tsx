'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MessageBanner from "@/components/MessageBanner";
import { useToken } from "@/hooks/useToken";
import Login from "@/components/Login";

function PageContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const { token } = useToken();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      router.replace('/matches');
    } else {
      setIsLoading(false);
    }
  }, [token, router]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {message && <MessageBanner message={message} />}
      
      <section className="text-center">
        <h1 className="text-5xl font-extrabold text-foreground mb-4">Welcome to CricketScore</h1>
        <p className="text-xl text-secondary mb-8">
          Your ultimate source for real-time cricket scores and updates.
        </p>
      </section>
      <Login />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}
