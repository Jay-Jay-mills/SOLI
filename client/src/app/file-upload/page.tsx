'use client';

import { MainLayout } from '@/Layouts';
import { FileUploadContainer } from '@/Containers';
import { useProtectedRoute } from '@/Hooks';

export default function FileUploadPage() {
  useProtectedRoute();

  return (
    <MainLayout>
      <FileUploadContainer />
    </MainLayout>
  );
}
