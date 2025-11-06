'use client';

import { useAuthStore } from '@/State';
import { authService } from '@/Services';
import type { LoginCredentials, UserRole } from '@/Interfaces';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/Constants';

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const router = useRouter();
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

  /**
   * Login function
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // Store the access token
      setTokens(response.data.accessToken);
      
      // Fetch user data after successful login
      const userResponse = await authService.getMe();
      setUser(userResponse.data);
      
      // Redirect to dashboard
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      router.push(ROUTES.HOME); // Redirect to home (login page)
    }
  };

  /**
   * Check if user has specific role
   */
  const checkRole = (role: UserRole): boolean => {
    return hasRole(role);
  };

  /**
   * Check if user has permission
   */
  const hasPermission = (permission: string): boolean => {
    // Implement your permission logic here
    if (user?.role === 'admin') return true;
    // Add more granular permissions as needed
    return false;
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole: checkRole,
    hasPermission,
  };
};

export default useAuth;
