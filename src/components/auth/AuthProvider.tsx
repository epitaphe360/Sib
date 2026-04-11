import React, { createContext, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    // Marquer comme initialisé après le premier rendu
    setIsInitialized(true);
  }, []);

  const value = {
    isInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};