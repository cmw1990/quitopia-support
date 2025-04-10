import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string;
  // Add other relevant user profile fields
}

interface UserContextType {
  userProfile: UserProfile | null;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

export const UserContext = createContext<UserContextType>({
  userProfile: null,
  updateUserProfile: () => {}
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      const initialProfile: UserProfile = {
        id: user.id,
        email: user.email ?? undefined,
        displayName: user.user_metadata?.display_name ?? undefined
      };
      setUserProfile(initialProfile);
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...profile } : null);
  };

  return (
    <UserContext.Provider value={{ userProfile, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export default UserContext;