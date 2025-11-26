'use client';

import React from 'react';
import { MainLayout } from '@/Layouts';
import { DeletedProjects } from '@/Containers/DeletedProjects/DeletedProjects';
import { useProtectedRoute } from '@/Hooks';
import { UserRole } from '@/Interfaces';

export default function DeletedProjectsPage() {
    useProtectedRoute(UserRole.SUPERADMIN);

    return (
        <MainLayout showSidebar={false}>
            <DeletedProjects />
        </MainLayout>
    );
}
