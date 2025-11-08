'use client';

import React from 'react';
import { Layout } from 'antd';
import { Header } from '@/Layouts';
import { ProjectDetail } from '@/Containers';
import { useProtectedRoute } from '@/Hooks';

const { Content } = Layout;

export default function ProjectDetailPage({ params }: { params: { _id: string } }) {
  const { isLoading } = useProtectedRoute();

  if (isLoading) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      <Content style={{ 
        padding: '32px 48px',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%'
      }}>
        <ProjectDetail projectId={params._id} />
      </Content>
    </Layout>
  );
}
