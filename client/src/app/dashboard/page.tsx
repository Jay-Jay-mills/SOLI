'use client';

import { Layout, Spin } from 'antd';
import { Header } from '@/Layouts';
import { Dashboard } from '@/Containers';
import { useProtectedRoute } from '@/Hooks';

const { Content } = Layout;

export default function DashboardPage() {
  const { isLoading } = useProtectedRoute();

  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Header />
        <Content style={{ 
          padding: '32px 48px',
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
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
        <Dashboard />
      </Content>
    </Layout>
  );
}
