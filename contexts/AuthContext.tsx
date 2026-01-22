'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for mock user on mount
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simple mock authentication
    // Accept any email/password for development
    console.log('Mock sign in with:', email);
    
    // Create mock user
    const mockUser = {
      id: 'mock-user-id',
      email: email,
      user_metadata: { name: email.split('@')[0] },
      created_at: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    
    // Set user state
    setUser(mockUser);
    
    console.log('Mock sign in successful:', mockUser);
  };

  const signOut = async () => {
    // Remove from localStorage
    localStorage.removeItem('mock_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
