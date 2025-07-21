'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { useThemeContext } from "./ThemeProvider";

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeContext();

  const clerkAppearance = {
    variables: {
      colorPrimary: '#0ea5e9', // sky-500
      colorBackground: theme === 'dark' ? '#0a192f' : '#ffffff',
      colorInputBackground: theme === 'dark' ? '#334155' : '#f1f5f9',
      colorInputText: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      colorText: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      colorTextSecondary: theme === 'dark' ? '#94a3b8' : '#64748b',
      colorNeutral: theme === 'dark' ? '#334155' : '#e2e8f0',
      borderRadius: '0.75rem',
    },
    elements: {
      // Primary form buttons (Sign in, Sign up, etc.)
      formButtonPrimary: {
        backgroundColor: '#0ea5e9',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#0284c7',
          color: '#ffffff',
        },
      },
      
      // Secondary form buttons
      formButtonReset: {
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        '&:hover': {
          color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
        },
      },
      socialButtonsIconButton: {
        backgroundColor: '#ffffff',
        '&:hover': {
          backgroundColor: '#f1f5f9',  //off white
        },
      },
      // Social buttons (Continue with Google, etc.)
      socialButtonsBlockButton: {
        backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        border: theme === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
        '&:hover': {
          backgroundColor: theme === 'dark' ? '#475569' : '#e2e8f0',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        },
      },
      
      socialButtonsBlockButtonText: {
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        fontWeight: '500',
      },
      
      // User button dropdown items (Manage account, Sign out, etc.)
      userButtonPopoverActionButton: {
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        '&:hover': {
          backgroundColor: theme === 'dark' ? '#475569' : '#f1f5f9',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        },
      },
      
      userButtonPopoverActionButtonText: {
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      },
      
      userButtonPopoverFooter: {
        backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
        borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
      },
      
      // Profile modal tab buttons (Profile, Security, etc.)
      profileSectionPrimaryButton: {
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9',
        border: theme === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
        '&:hover': {
          backgroundColor: theme === 'dark' ? '#475569' : '#e2e8f0',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        },
      },
      
      // Tab navigation buttons in inactive state
      navbarButton: {
        color: theme === 'dark' ? '#94a3b8' : '#64748b',
        '&:hover': {
          color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
        },
      },
      
      // Active tab styling
      navbarButtonActive: {
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        backgroundColor: theme === 'dark' ? '#475569' : '#e2e8f0',
        borderColor: '#0ea5e9',
      },
      
      // Profile page tab navigation
      pageTabButton: {
        color: theme === 'dark' ? '#94a3b8' : '#64748b',
        backgroundColor: 'transparent',
        border: 'none',
        '&:hover': {
          color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
        },
      },
      
      pageTabButtonActive: {
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        borderBottomColor: '#0ea5e9',
        backgroundColor: 'transparent',
      },
      
      // Footer action links
      footerActionLink: {
        color: '#0ea5e9',
        '&:hover': {
          color: '#0284c7',
        },
      },
      
      // General text elements
      formFieldLabel: {
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      },
      
      formFieldInput: {
        backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        border: theme === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
        '&:focus': {
          borderColor: '#0ea5e9',
          boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.2)',
        },
      },
      
      card: {
        backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
        border: theme === 'dark' ? '2px solid #334155' : '2px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(16px)',
      },
      
      headerTitle: {
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      },
      
      headerSubtitle: {
        color: theme === 'dark' ? '#94a3b8' : '#64748b',
      },
      
      modalBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
      },
      
      modalContent: {
        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
        border: theme === 'dark' ? '2px solid #334155' : '2px solid #e2e8f0',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(16px)',
      },
    },
  };

  return (
    <ClerkProvider appearance={clerkAppearance}>
      {children}
    </ClerkProvider>
  );
} 