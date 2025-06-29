// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { config } from "@/config/env";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: config.app.name,
  description: config.app.description,
  keywords: ["cricket", "scores", "live", "sports", "real-time"],
  authors: [{ name: "CricketScore Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <meta name="theme-color" content="#0a192f" />
        </head>
        <body className={`${inter.className} min-h-screen overflow-x-hidden`}>
          <ErrorBoundary>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <footer className="mt-auto py-6 text-center text-slate-500 text-sm border-t border-slate-800/50">
                <p>&copy; 2024 {config.app.name}. Built with Next.js and TypeScript.</p>
              </footer>
            </div>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}