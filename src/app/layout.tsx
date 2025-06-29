// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cricket Score API",
  description: "Real-time cricket scores using TypeScript",
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
        </head>
        <body className={`${inter.className} min-h-screen overflow-x-hidden`}>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}