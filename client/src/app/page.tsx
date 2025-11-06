'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/Constants';
import { useAuth } from '@/Hooks';
import { LoginContainer } from '@/Containers';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect to dashboard if already authenticated
      router.push(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show login page if not authenticated
  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <LoginContainer />;
}
