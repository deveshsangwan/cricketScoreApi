export function getClerkAppearance(isDarkMode: boolean) {
  return {
    variables: {
      colorPrimary: '#0ea5e9',
      colorBackground: isDarkMode ? '#000000' : '#ffffff',
      colorInputBackground: isDarkMode ? '#111111' : '#f1f5f9',
      colorInputText: isDarkMode ? '#fafafa' : '#0f172a',
      colorText: isDarkMode ? '#fafafa' : '#0f172a',
      colorTextSecondary: isDarkMode ? '#a3a3a3' : '#64748b',
      colorNeutral: isDarkMode ? '#262626' : '#e2e8f0',
      borderRadius: '0.75rem',
    },
    elements: {
      formButtonPrimary: {
        backgroundColor: '#0ea5e9',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#0284c7',
          color: '#ffffff',
        },
      },
      formButtonReset: {
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        '&:hover': {
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
        },
      },
      socialButtonsIconButton: {
        backgroundColor: '#ffffff',
        '&:hover': {
          backgroundColor: '#f1f5f9',
        },
      },
      socialButtonsBlockButton: {
        backgroundColor: isDarkMode ? '#111111' : '#f1f5f9',
        color: isDarkMode ? '#fafafa' : '#0f172a',
        border: isDarkMode ? '1px solid #262626' : '1px solid #e2e8f0',
        '&:hover': {
          backgroundColor: isDarkMode ? '#18181b' : '#e2e8f0',
          color: isDarkMode ? '#ffffff' : '#000000',
        },
      },
      socialButtonsBlockButtonText: {
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        fontWeight: '500',
      },
      userButtonPopoverActionButton: {
        color: isDarkMode ? '#fafafa' : '#0f172a',
        '&:hover': {
          backgroundColor: isDarkMode ? '#18181b' : '#f1f5f9',
          color: isDarkMode ? '#ffffff' : '#000000',
        },
      },
      userButtonPopoverActionButtonText: {
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
      },
      userButtonPopoverFooter: {
        backgroundColor: isDarkMode ? '#0b0b0f' : '#f8fafc',
        borderTop: isDarkMode ? '1px solid #262626' : '1px solid #e2e8f0',
      },
      profileSectionPrimaryButton: {
        color: isDarkMode ? '#fafafa' : '#0f172a',
        backgroundColor: isDarkMode ? '#111111' : '#f1f5f9',
        border: isDarkMode ? '1px solid #262626' : '1px solid #e2e8f0',
        '&:hover': {
          backgroundColor: isDarkMode ? '#18181b' : '#e2e8f0',
          color: isDarkMode ? '#ffffff' : '#000000',
        },
      },
      navbarButton: {
        color: isDarkMode ? '#a3a3a3' : '#64748b',
        '&:hover': {
          color: isDarkMode ? '#fafafa' : '#0f172a',
          backgroundColor: isDarkMode ? '#18181b' : '#f3f4f6',
        },
      },
      navbarButtonActive: {
        color: isDarkMode ? '#fafafa' : '#0f172a',
        backgroundColor: isDarkMode ? '#18181b' : '#e2e8f0',
        borderColor: '#0ea5e9',
      },
      pageTabButton: {
        color: isDarkMode ? '#a3a3a3' : '#64748b',
        backgroundColor: 'transparent',
        border: 'none',
        '&:hover': {
          color: isDarkMode ? '#fafafa' : '#0f172a',
          backgroundColor: isDarkMode ? '#18181b' : '#f3f4f6',
        },
      },
      pageTabButtonActive: {
        color: isDarkMode ? '#fafafa' : '#0f172a',
        borderBottomColor: '#0ea5e9',
        backgroundColor: 'transparent',
      },
      footerActionLink: {
        color: '#0ea5e9',
        '&:hover': {
          color: '#0284c7',
        },
      },
      formFieldLabel: {
        color: isDarkMode ? '#fafafa' : '#0f172a',
      },
      formFieldInput: {
        backgroundColor: isDarkMode ? '#111111' : '#f1f5f9',
        color: isDarkMode ? '#fafafa' : '#0f172a',
        border: isDarkMode ? '1px solid #262626' : '1px solid #e2e8f0',
        '&:focus': {
          borderColor: '#0ea5e9',
          boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.2)',
        },
      },
      card: {
        backgroundColor: isDarkMode ? '#111111' : '#f8fafc',
        border: isDarkMode ? '1px solid #262626' : '1px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(16px)',
      },
      headerTitle: {
        color: isDarkMode ? '#fafafa' : '#0f172a',
      },
      headerSubtitle: {
        color: isDarkMode ? '#a3a3a3' : '#64748b',
      },
      modalBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
      },
      modalContent: {
        backgroundColor: isDarkMode ? '#0b0b0f' : '#ffffff',
        border: isDarkMode ? '1px solid #262626' : '1px solid #e2e8f0',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(16px)',
      },
    },
  };
}
