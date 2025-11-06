'use client';

import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  UploadOutlined,
  UserOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/Constants';
import { useAuth } from '@/Hooks';

const { Sider: AntSider } = Layout;

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push(ROUTES.DASHBOARD),
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: 'File Upload',
      onClick: () => router.push(ROUTES.FILE_UPLOAD),
    },
    ...(isAdmin
      ? [
          {
            key: 'admin',
            icon: <UserOutlined />,
            label: 'Admin Portal',
            onClick: () => router.push(ROUTES.ADMIN_USERS),
          },
        ]
      : []),
  ];

  return (
    <AntSider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="min-h-screen"
      trigger={
        collapsed ? (
          <MenuUnfoldOutlined className="text-lg" />
        ) : (
          <MenuFoldOutlined className="text-lg" />
        )
      }
      theme="dark"
    >
      <div className="flex h-16 items-center justify-center border-b border-neutral-700">
        <h1 className="text-lg font-bold text-white">
          {collapsed ? 'S' : 'SOLI'}
        </h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        items={menuItems}
      />
    </AntSider>
  );
};

export default Sidebar;
