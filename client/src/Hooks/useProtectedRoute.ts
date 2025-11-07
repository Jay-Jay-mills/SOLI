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
  const { isAuthenticated, user, isLoading, isHydrated } = useAuth();

  useEffect(() => {
    // Wait for store hydration to complete
    if (!isHydrated || isLoading) {
      return;
    }

    // Not authenticated
    if (!isAuthenticated) {
      router.push(ROUTES.HOME); // Redirect to home (login page)
      return;
    }

    // Check role requirement
    if (requiredRole && user?.role !== requiredRole) {
      router.push(ROUTES.UNAUTHORIZED);
    }
  }, [isAuthenticated, user, isLoading, isHydrated, requiredRole, router]);

  return { isLoading: isLoading || !isHydrated, isAuthenticated, user };
};

export default useProtectedRoute;
