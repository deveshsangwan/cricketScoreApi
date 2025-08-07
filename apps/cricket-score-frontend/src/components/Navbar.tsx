// src/components/Navbar.tsx
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/40 border-b border-border/60 shadow-lg after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-sky-500/40 after:via-transparent after:to-purple-500/40">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold heading-gradient">
          CricketScore
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-sky-500/25 focus-visible:ring-2 focus-visible:ring-sky-500/50 focus:outline-none border border-white/10">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}