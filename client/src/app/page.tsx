'use client';

import { redirect } from 'next/navigation';
import { ROUTES } from '@/Constants';

export default function HomePage() {
  // Redirect to login page
  redirect(ROUTES.LOGIN);
}
