// src/components/Navbar.tsx
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="shadow-lg"> 
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-slate-100">
          CricketScore
        </Link>
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 rounded-lg border border-sky-500 text-sky-400 font-semibold hover:bg-sky-500 hover:text-white transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}