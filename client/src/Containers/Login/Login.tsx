'use client';

import React, { useState } from 'react';
import { Card, message } from 'antd';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/Components/Molecules';
import { useAuth } from '@/Hooks';
import type { LoginCredentials } from '@/Interfaces';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      await login(credentials);
      message.success('Login successful!');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center p-4 md:p-8 lg:p-12"
      style={{
        backgroundImage: 'url("/login-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Gradient overlay for better contrast */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.15) 0%, rgba(0, 21, 41, 0.25) 100%)',
          backdropFilter: 'blur(1px)',
        }}
      />

      {/* Right-aligned login form */}
      <div
        className="w-full flex justify-end relative z-10"
        style={{ paddingRight: '80px' }}
      >
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full"
          style={{ maxWidth: '480px' }}
        >
          <Card
            className="shadow-2xl border-0"
            bodyStyle={{ padding: '48px 40px' }}
            bordered={false}
            style={{
              background: 'rgba(255, 255, 255, 0.10)',
              backdropFilter: 'blur(100px)',
              borderRadius: '16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Logo with animation */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img src="/logo.svg" alt="SOLI Logo" style={{ height: '56px' }} />
            </motion.div>

            {/* Header with animation */}
            <motion.div
              className="mb-8 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
                Welcome Back
              </h1>
              <p className="text-white/90 text-base">
                Sign in to your account
              </p>
            </motion.div>

            {/* Form with animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <LoginForm onSubmit={handleLogin} loading={loading} />
            </motion.div>
          </Card>

          {/* Footer with animation */}
          <motion.div
            className="text-center text-white text-sm mt-6 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            &copy; {new Date().getFullYear()} Jay Jay Mills. All rights reserved.
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
