'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Space, Skeleton } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/Hooks';
import { getInitials } from '@/Helpers';

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const { user, logout, isHydrated } = useAuth();

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

  // Get user display info only after hydration
  const userDisplayName = isHydrated ? (user?.firstName || 'User') : '';
  const userInitials = isHydrated ? getInitials(user?.firstName + ' ' + user?.lastName || 'User') : '?';

  return (
    <AntHeader 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        padding: '0 48px',
        lineHeight: '64px',
        height: '64px',
        borderBottom: '1px solid #404040',
      }}
    >
      <div style={{ 
        maxWidth: '1600px', 
        margin: '0 auto', 
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        <h1 style={{ 
          color: '#ffffff', 
          fontSize: '24px', 
          fontWeight: 700,
          letterSpacing: '-0.5px',
          margin: 0,
          padding: 0,
          lineHeight: '64px'
        }}>
          <span style={{
            color: '#667eea',
            fontWeight: 800
          }}>SOLI</span>
        </h1>
        
        {!isHydrated ? (
          <Space style={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton.Button active size="small" style={{ width: 80, height: 24 }} />
            <Skeleton.Avatar active size={40} shape="circle" />
          </Space>
        ) : (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                fontWeight: 500, 
                color: '#000000ff', 
                marginRight: '12px',
                fontSize: '15px'
              }}>
                {userDisplayName}
              </span>
              <Avatar size={40} style={{ 
                backgroundColor: '#667eea', 
                border: '2px solid #764ba2',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
                fontWeight: 600,
                fontSize: '16px'
              }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  userInitials
                )}
              </Avatar>
            </Space>
          </Dropdown>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;
