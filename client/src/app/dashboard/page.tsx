'use client';

import { Layout } from 'antd';
import { Header } from '@/Layouts';
import { Dashboard } from '@/Containers';
import { useProtectedRoute } from '@/Hooks';

const { Content } = Layout;

export default function DashboardPage() {
  useProtectedRoute();

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
