// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkWrapper } from "@/components/ClerkWrapper";
import { MatchCacheProvider } from "@/contexts/MatchCacheContext";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var theme = 'light'; // default theme
                  if (savedTheme) {
                    theme = savedTheme;
                  } else {
                    // Check system preference
                    var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = systemPrefersDark ? 'dark' : 'light';
                  }
                  
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  // Fallback to dark theme if there's any error
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />

      </head>
      <body className={`${inter.className} min-h-screen overflow-x-hidden bg-gradient-theme`}>
        <ThemeProvider>
          <ClerkWrapper>
            <MatchCacheProvider>
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
            </MatchCacheProvider>
          </ClerkWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}