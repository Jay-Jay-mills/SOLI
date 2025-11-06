'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/State';
import type { AuthContextType } from '@/Interfaces';
import { authService } from '@/Services';
import type { LoginCredentials, UserRole } from '@/Interfaces';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    setUser,
    setTokens,
    clearAuth,
    setLoading,
    hasRole,
  } = useAuthStore();

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setTokens(response.data.accessToken);
      
      // Fetch user data after successful login
      const userResponse = await authService.getMe();
      setUser(userResponse.data);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    clearAuth();
  };

  const checkRole = (role: UserRole): boolean => {
    return hasRole(role);
  };

  const hasPermission = (permission: string): boolean => {
    if (user?.role === 'admin') return true;
    return false;
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole: checkRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export default AuthProvider;
