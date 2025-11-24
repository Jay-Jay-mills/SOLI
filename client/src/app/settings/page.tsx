'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, Button } from 'antd';
import { UserOutlined, TeamOutlined, ArrowLeftOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/Layouts';
import { UserManagement, CustomerManagement, UserGroupManagement } from '@/Containers';
import { useProtectedRoute, useAuth } from '@/Hooks';
import { UserRole } from '@/Interfaces';
import { ROUTES } from '@/Constants';

export default function SettingsPage() {
  useProtectedRoute(UserRole.SUPERADMIN);
  const { user } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  const handleBack = () => {
    router.push(ROUTES.DASHBOARD);
  };

  // Don't render tabs until client-side mounted
  if (!isMounted) {
    return (
      <MainLayout showSidebar={false}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ marginRight: '16px' }}
            >
              Back
            </Button>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>
              Settings
            </h1>
          </div>
        </div>
      </MainLayout>
    );
  }

  const tabItems = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          User Management
        </span>
      ),
      children: <UserManagement />,
    },
  ];

  // Add Customer Management tab only for SuperAdmins
  if (isSuperAdmin) {
    tabItems.push({
      key: 'customers',
      label: (
        <span>
          <TeamOutlined />
          Customer Management
        </span>
      ),
      children: <CustomerManagement />,
    });
    
    // Add User Group Management tab only for SuperAdmins
    tabItems.push({
      key: 'usergroups',
      label: (
        <span>
          <UsergroupAddOutlined />
          User Group Management
        </span>
      ),
      children: <UserGroupManagement />,
    });
  }

  return (
    <MainLayout showSidebar={false}>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginRight: '16px' }}
          >
            Back
          </Button>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>
            Settings
          </h1>
        </div>
        <Tabs
          defaultActiveKey="users"
          items={tabItems}
          size="large"
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />
      </div>
    </MainLayout>
  );
}
