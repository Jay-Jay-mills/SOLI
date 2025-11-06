'use client';

import React, { useState } from 'react';
import { Card, message, Alert } from 'antd';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/Components/Molecules';
import { useAuth } from '@/Hooks';
import type { LoginCredentials } from '@/Interfaces';

export const LoginContainer: React.FC = () => {
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md space-y-4">
        {/* Demo Credentials Info */}
        <Alert
          message="Demo Mode - Test Credentials"
          description={
            <div className="space-y-2">
              <div>
                <strong>SOLI Admin Account:</strong>
                <div className="text-sm">Username: SOLIAdmin</div>
                <div className="text-sm">Password: soli123</div>
              </div>
              <div>
                <strong>GRIR Admin Account:</strong>
                <div className="text-sm">Username: GRIRAdmin</div>
                <div className="text-sm">Password: grir123</div>
              </div>
            </div>
          }
          type="info"
          showIcon
        />

        <Card className="shadow-hard">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-primary-600">Welcome Back</h1>
            <p className="mt-2 text-neutral-500">Sign in to SOLI Enterprise Portal</p>
          </div>
          
          <LoginForm onSubmit={handleLogin} loading={loading} />
        </Card>
      </div>
    </div>
  );
};

export default LoginContainer;
