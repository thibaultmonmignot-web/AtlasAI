import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const ADMIN_EMAIL = 'thibaultmonmignot@gmail.com';

  const isAdminUser = () => {
    return currentUser?.email === ADMIN_EMAIL;
  };

  useEffect(() => {
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = () => {
    return pb.collection('users').authWithOAuth2({ provider: 'google' }).then((authData) => {
      if (authData.record.email !== ADMIN_EMAIL) {
        pb.authStore.clear();
        setCurrentUser(null);
        toast.error('Access Denied: You are not authorized as an admin.');
        throw new Error('NOT_ADMIN');
      }
      return authData;
    });
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const refreshUser = async () => {
    if (currentUser) {
      try {
        const updated = await pb.collection('users').getOne(currentUser.id, { $autoCancel: false });
        setCurrentUser(updated);
        return updated;
      } catch (error) {
        console.error('Failed to refresh user:', error);
        return currentUser;
      }
    }
    return null;
  };

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
    refreshUser,
    isAuthenticated: !!currentUser,
    isAdminUser,
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading PixelWar...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
