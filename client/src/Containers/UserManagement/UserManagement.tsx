'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, message, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '@/Services';
import { useUserStore } from '@/State';
import { useAuth } from '@/Hooks';
import type { User, CreateUserDto, UserRole, UserStatus } from '@/Interfaces';
import { formatDate } from '@/Helpers';

export const UserManagement: React.FC = () => {
  const { user: loggedInUser } = useAuth();
  const userStore = useUserStore();
  const users = Array.isArray(userStore?.users) ? userStore.users : [];
  const { setUsers, addUser, updateUser, removeUser } = userStore || {};
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadUsers();
    }
  }, [isMounted]);

  const loadUsers = async () => {
    if (!setUsers) return;
    try {
      setLoading(true);
      const response = await userService.getUsers({ page: 1, pageSize: 100 });
      setUsers(response.data);
    } catch (error: any) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on logged-in user's isSOLI status
  const filteredUsers = users.filter(user => user.isSOLI === loggedInUser?.isSOLI);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = async (userId: string) => {
    if (!removeUser) return;
    try {
      await userService.deleteUser(userId);
      removeUser(userId);
      message.success('User deleted successfully!');
    } catch (error: any) {
      message.error('Failed to delete user');
    }
  };

  const handleSubmit = async () => {
    if (!addUser || !updateUser) return;
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        // Update existing user
        const updated = await userService.updateUser(editingUser.id, values);
        updateUser(editingUser.id, updated);
        message.success('User updated successfully!');
      } else {
        // Create new user
        const newUser = await userService.createUser(values as CreateUserDto);
        addUser(newUser);
        message.success('User created successfully!');
        // Reload users to ensure we have the latest data
        await loadUsers();
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || 'Failed to save user');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'User Type',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin: boolean) => (
        <Tag color={isAdmin ? 'red' : 'blue'}>
          {isAdmin ? 'ADMIN' : 'USER'}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: true },
        { text: 'User', value: false },
      ],
      onFilter: (value, record) => record.isAdmin === value,
    },
    {
      title: 'Active Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Don't render table until mounted
  if (!isMounted) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>User Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
          Add User
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="isAdmin"
            label="User Type"
            valuePropName="checked"
          >
            <Switch checkedChildren="Admin" unCheckedChildren="User" />
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="isActive"
              label="Active Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
