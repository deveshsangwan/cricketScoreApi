// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { config } from "@/config/env";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: config.app.name,
  description: config.app.description,
  keywords: ["cricket", "scores", "live", "sports", "real-time"],
  authors: [{ name: "CricketScore Team" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        </head>
        <body className={`${inter.className} min-h-screen overflow-x-hidden bg-gradient-theme`}>
          <ThemeProvider>
            <ErrorBoundary>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <footer className="mt-auto py-6 text-center text-muted-foreground text-sm border-t border-border">
                  <p>&copy; 2024 {config.app.name}. Built with Next.js and TypeScript.</p>
                </footer>
              </div>
            </ErrorBoundary>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}