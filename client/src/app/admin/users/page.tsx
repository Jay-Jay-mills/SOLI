'use client';

import { MainLayout } from '@/Layouts';
import { UserManagementContainer } from '@/Containers';
import { useProtectedRoute } from '@/Hooks';
import { UserRole } from '@/Interfaces';

export default function AdminUsersPage() {
  useProtectedRoute(UserRole.ADMIN);

  return (
    <MainLayout>
      <UserManagementContainer />
    </MainLayout>
  );
}
