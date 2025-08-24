'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { useThemeContext } from "./ThemeProvider";
import { getClerkAppearance } from "@/config/clerkAppearance";

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeContext();

  const isDarkMode = theme === 'dark';
  const clerkAppearance = getClerkAppearance(isDarkMode);

  return (
    <ClerkProvider appearance={clerkAppearance}>
      {children}
    </ClerkProvider>
  );
} 