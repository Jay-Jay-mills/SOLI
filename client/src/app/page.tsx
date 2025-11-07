'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/Constants';
import { useAuth } from '@/Hooks';
import { LoginContainer } from '@/Containers';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isHydrated } = useAuth();

  useEffect(() => {
    // Wait for store hydration before redirecting
    if (isHydrated && !isLoading && isAuthenticated) {
      // Redirect to dashboard if already authenticated
      router.push(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isLoading, isHydrated, router]);

  // Show loading while hydrating or loading
  if (!isHydrated || isLoading) {
    return null; // Or a loading spinner
  }

  return <LoginContainer />;
}
