'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/Hooks';
import { getInitials } from '@/Helpers';

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <AntHeader className="flex items-center justify-between bg-white px-6 shadow-soft">
      <div className="text-xl font-bold text-primary-600">SOLI Enterprise Portal</div>
      
      <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
        <Space className="cursor-pointer">
          <Avatar className="bg-primary">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              getInitials(user?.firstName + ' ' + user?.lastName || 'User')
            )}
          </Avatar>
          <span className="font-medium">{user?.firstName || 'User'}</span>
        </Space>
      </Dropdown>
    </AntHeader>
  );
};

export default Header;
