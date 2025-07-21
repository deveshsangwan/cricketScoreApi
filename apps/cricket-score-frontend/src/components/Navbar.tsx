// src/components/Navbar.tsx
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="shadow-xl bg-card/40 backdrop-blur-sm border-b-2 border-border/60 sticky top-0 z-50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-card/50 before:to-card/30 before:backdrop-blur-sm before:-z-10"> 
      <div className="container mx-auto px-6 py-3 flex justify-between items-center relative">
        <Link href="/" className="text-2xl font-bold text-foreground drop-shadow-md">
          CricketScore
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 shadow-xl hover:shadow-primary/30 backdrop-blur-sm border border-primary/20">
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