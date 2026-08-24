import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types/user';
import { mockAttendeeUser, mockOrganizerUser, mockAdminUser } from '../data/mockUsers';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loginWithTelegram: (asRole?: UserRole) => void;
  loginAsDemoUser: (demoRole: UserRole) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sheba_auth_user');
      return saved ? JSON.parse(saved) : mockAttendeeUser;
    } catch {
      return mockAttendeeUser;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('sheba_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sheba_auth_user');
    }
  }, [user]);

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
  };

  const loginWithTelegram = (asRole: UserRole = 'ATTENDEE') => {
    loginAsDemoUser(asRole);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sheba_auth_user');
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
        loginWithTelegram,
        loginAsDemoUser,
        logout,
        switchRole,
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
