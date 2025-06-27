import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-bold text-2xl text-primary">
            🏏 CricketScore
          </Link>
          <div className="space-x-6">
            <Link href="/matches" className="text-foreground hover:text-primary transition-colors">
              Live Matches
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}