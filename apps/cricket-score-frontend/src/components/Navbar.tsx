// src/components/Navbar.tsx
'use client';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const showBackButton = /^\/matches\/[^\/]+$/.test(pathname);
  return (
    <nav className="sticky top-0 z-50 bg-background/50 border-b border-border/50 shadow-lg after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-teal-500/30 after:via-transparent after:to-emerald-500/30">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              type="button"
              aria-label="Go back"
              className="btn btn-ghost px-3 py-2"
              onClick={() => router.back()}
            >
              ← Back
            </button>
          )}
          <Link href="/" className="text-2xl font-extrabold heading-gradient">
            CricketScore
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="btn btn-primary px-4 py-2">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton/>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}