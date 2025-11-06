'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { ROUTES } from '@/Constants';
import type { UserRole } from '@/Interfaces';

/**
 * Custom hook for route protection
 */
export const useProtectedRoute = (requiredRole?: UserRole) => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
        return;
      }

      // Check role requirement
      if (requiredRole && user?.role !== requiredRole) {
        router.push(ROUTES.UNAUTHORIZED);
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router]);

  return { isLoading, isAuthenticated, user };
};

export default useProtectedRoute;
