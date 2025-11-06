'use client';

import React from 'react';
import { Form, Input, Checkbox } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button } from '@/Components/Atoms';
import type { LoginCredentials } from '@/Interfaces';

interface LoginFormProps {
  onSubmit: (values: LoginCredentials) => void;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading = false }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSubmit({
      username: values.username,
      password: values.password,
      rememberMe: values.rememberMe || false,
    });
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={handleFinish}
      layout="vertical"
      size="large"
      autoComplete="off"
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: 'Please input your username!' },
        ]}
      >
        <Input
          prefix={<UserOutlined className="text-neutral-400" />}
          placeholder="Username"
          autoComplete="username"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-neutral-400" />}
          placeholder="Password"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item name="rememberMe" valuePropName="checked">
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" fullWidth loading={loading}>
          Sign In
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
