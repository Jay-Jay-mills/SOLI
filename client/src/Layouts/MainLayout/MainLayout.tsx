'use client';

import React, { ReactNode } from 'react';
import { Layout } from 'antd';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

const { Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout>
        <Header />
        <Content className="m-6 min-h-[calc(100vh-88px)]">
          <div className="rounded-lg bg-white p-6 shadow-soft">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
