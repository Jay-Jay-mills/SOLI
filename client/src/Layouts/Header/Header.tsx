'use client';

import React, { useEffect } from 'react';
import { Layout, Avatar, Dropdown, Space, Skeleton } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/Hooks';
import { getInitials } from '@/Helpers';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/Constants';

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const { user, logout, isHydrated } = useAuth();
  const router = useRouter();

  // set document title and favicon client-side
  useEffect(() => {
    try {
      document.title = 'SOLI';
      const head = document.getElementsByTagName('head')[0];
      let icon = head.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        head.appendChild(icon);
      }
      // prefer svg favicon placed in public folder
      icon.href = '/favicon.svg';
    } catch (e) {
      // silent fallback if DOM not available or script blocked
      // (Next.js server renders first; this only runs client-side)
    }
  }, []);

  const handleLogoClick = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'settings') {
      router.push('/settings');
    }
  };

  // Check if user is admin
  const isAdmin = user?.isAdmin || false;

  const menuItems: MenuProps['items'] = [
    // Only show settings for admins
    ...(isAdmin ? [{
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    }] : []),
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
        {/* Logo: clickable image (fallback to text for accessibility) */}
        <div
          role="button"
          aria-label="Go to dashboard"
          onClick={handleLogoClick}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
             <img
               src="/SOLI.png"
               alt="SOLI logo"
               style={{ height: 24, width: 'auto', display: 'block' }}
               draggable={false}
               onError={(e) => {
                 // If SOLI.png isn't present, fall back to the SVG we created earlier
                 const target = e.currentTarget as HTMLImageElement;
                 if (target.src.endsWith('/SOLI.png')) target.src = '/logo.svg';
               }}
             />
          <span style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }} aria-hidden>
            SOLI
          </span>
        </div>
        
        {!isHydrated ? (
          <Space style={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton.Button active size="small" style={{ width: 80, height: 24 }} />
            <Skeleton.Avatar active size={40} shape="circle" />
          </Space>
        ) : (
          <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
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
