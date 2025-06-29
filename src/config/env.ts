/**
 * Application configuration and environment variables
 * 
 * To set up environment variables:
 * 1. Create a .env.local file in your project root
 * 2. Add the following variables:
 * 
 * NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
 * NEXT_PUBLIC_APP_NAME=CricketScore
 * NEXT_PUBLIC_APP_DESCRIPTION=Your ultimate source for real-time cricket scores and updates
 * NEXT_PUBLIC_ENABLE_REAL_TIME=true
 * NODE_ENV=development
 */

interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  app: {
    name: string;
    description: string;
    version: string;
  };
  features: {
    realTime: boolean;
    notifications: boolean;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    console.warn(`Environment variable ${key} is not set`);
    return defaultValue || '';
  }
  return value;
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:3001'),
    timeout: 10000, // 10 seconds
  },
  app: {
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'CricketScore'),
    description: getEnvVar(
      'NEXT_PUBLIC_APP_DESCRIPTION', 
      'Your ultimate source for real-time cricket scores and updates'
    ),
    version: '1.0.0',
  },
  features: {
    realTime: getBooleanEnvVar('NEXT_PUBLIC_ENABLE_REAL_TIME', true),
    notifications: getBooleanEnvVar('NEXT_PUBLIC_ENABLE_NOTIFICATIONS', false),
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// API endpoints
export const endpoints = {
  liveMatches: `${config.api.baseUrl}/liveMatches`,
  matchStats: (matchId: string) => `${config.api.baseUrl}/matchStats/${matchId}`,
} as const;

// Validate required environment variables
export const validateConfig = () => {
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];

  const missing = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0 && config.isProduction) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  if (missing.length > 0 && config.isDevelopment) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. Using defaults.`
    );
  }
};

// Run validation
validateConfig(); 