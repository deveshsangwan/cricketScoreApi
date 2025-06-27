import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TokenStore {
  token: string | null;
  generateToken: (clientId: string, clientSecret: string) => Promise<void>;
}

export const useToken = create<TokenStore>()(
  persist(
    (set) => ({
      token: null,
      generateToken: async (clientId: string, clientSecret: string) => {
        try {
          const response = await fetch('http://localhost:3001/generateToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientId, clientSecret }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate token');
          }

          const data = await response.json();
          set({ token: data.response.token });
        } catch (error) {
          console.error('Error generating token:', error);
          throw error;
        }
      },
    }),
    {
      name: 'cricket-token-storage', // unique name for localStorage key
    }
  )
); 