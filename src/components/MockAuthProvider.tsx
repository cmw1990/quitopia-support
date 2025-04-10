import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
}

const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  preferences: {
    theme: 'dark' as const,
    notifications: true
  }
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  user: mockUser
});

export function MockAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ isAuthenticated: true, user: mockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
