import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types/user';
import { api, getAuthToken } from '../services/api';
import { mockAttendeeUser, mockOrganizerUser, mockAdminUser } from '../data/mockUsers';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    phone?: string;
    organization?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  loginWithTelegram: (asRole?: UserRole) => void;
  loginAsDemoUser: (demoRole: UserRole) => void;
  switchRole: (newRole: UserRole) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      // Check if fallback user was saved in localStorage
      const savedUser = localStorage.getItem('sheba_auth_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await api.auth.getMe();
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('sheba_auth_user', JSON.stringify(currentUser));
      } else {
        setUser(null);
        localStorage.removeItem('sheba_auth_user');
      }
    } catch (e) {
      console.error('Failed to load session user from backend:', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setUser(res.user);
      localStorage.setItem('sheba_auth_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    phone?: string;
    organization?: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(userData);
      setUser(res.user);
      localStorage.setItem('sheba_auth_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('sheba_auth_user');
      localStorage.removeItem('sheba_auth_token');
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = (demoRole: UserRole) => {
    let targetUser: User;
    if (demoRole === 'ORGANIZER') {
      targetUser = mockOrganizerUser;
    } else if (demoRole === 'ADMIN') {
      targetUser = mockAdminUser;
    } else {
      targetUser = mockAttendeeUser;
    }
    setUser(targetUser);
    localStorage.setItem('sheba_auth_user', JSON.stringify(targetUser));
  };

  const loginWithTelegram = (asRole: UserRole = 'ATTENDEE') => {
    loginAsDemoUser(asRole);
  };

  const switchRole = (newRole: UserRole) => {
    loginAsDemoUser(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loginWithTelegram,
        loginAsDemoUser,
        switchRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
