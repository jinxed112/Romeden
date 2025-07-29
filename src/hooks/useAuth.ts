import { useState } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return {
    user: isAuthenticated ? { email: 'admin@romeden.fr' } : null,
    session: isAuthenticated ? { user: { email: 'admin@romeden.fr' } } : null,
    loading: false,
    isAuthenticated,
    signIn: async (email: string, password: string) => {
      // Connexion factice pour admin@romeden.fr
      if (email === 'admin@romeden.fr' && password === 'Melissa112=') {
        setIsAuthenticated(true);
        return { error: undefined };
      }
      return { error: new Error('Identifiants incorrects') };
    },
    signOut: async () => {
      setIsAuthenticated(false);
    },
    resetPassword: async (email: string) => ({ error: new Error('Reset désactivé') })
  };
};
