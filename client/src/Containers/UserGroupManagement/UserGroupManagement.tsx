'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Tag, Popconfirm, Select, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userGroupService, userService } from '@/Services';
import type { UserGroup, CreateUserGroupDto, UpdateUserGroupDto, User } from '@/Interfaces';
import { formatDate } from '@/Helpers';
import { ViewUserGroupModal } from './ViewUserGroupModal';

const { TextArea } = Input;

export const UserGroupManagement: React.FC = () => {
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<UserGroup | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadUserGroups();
      loadUsers();
    }
  }, [isMounted]);

  const loadUserGroups = async () => {
    try {
      setLoading(true);
      const response = await userGroupService.getUserGroups({ page: 1, pageSize: 100 });
      setUserGroups(response.data);
    } catch (error: any) {
      message.error('Failed to load user groups');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers({ page: 1, pageSize: 100 });
      setUsers(response.data);
    } catch (error: any) {
      message.error('Failed to load users');
    }
  };

  const handleCreate = () => {
    setEditingGroup(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (group: UserGroup) => {
    setEditingGroup(group);
    form.setFieldsValue({
      name: group.name,
      description: group.description,
      admins: group.admins.map((a: any) => a._id || a.id || a),
      users: group.users.map((u: any) => u._id || u.id || u),
      isActive: group.isActive,
    });
    setModalVisible(true);
  };

  const handleView = (group: UserGroup) => {
    setViewingGroup(group);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await userGroupService.deleteUserGroup(id);
      message.success('User group deleted successfully');
      loadUserGroups();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete user group');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingGroup) {
        // Update existing group
        const updateData: UpdateUserGroupDto = {
          name: values.name,
          description: values.description,
          admins: values.admins || [],
          users: values.users || [],
          isActive: values.isActive,
        };
        await userGroupService.updateUserGroup(editingGroup._id || editingGroup.id, updateData);
        message.success('User group updated successfully');
      } else {
        // Create new group
        const createData: CreateUserGroupDto = {
          name: values.name,
          description: values.description,
          admins: values.admins || [],
          users: values.users || [],
          isActive: values.isActive ?? true,
        };
        await userGroupService.createUserGroup(createData);
        message.success('User group created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      loadUserGroups();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error(error.response?.data?.message || 'Operation failed');
      }
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingGroup(null);
  };

  const columns: ColumnsType<UserGroup> = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Admins',
      dataIndex: 'admins',
      key: 'admins',
      render: (admins: (string | User)[]) => (
        <Tag icon={<TeamOutlined />} color="blue">
          {admins.length} {admins.length === 1 ? 'Admin' : 'Admins'}
        </Tag>
      ),
    },
    {
      title: 'Members',
      dataIndex: 'users',
      key: 'users',
      render: (users: (string | User)[]) => (
        <Tag icon={<TeamOutlined />} color="green">
          {users.length} {users.length === 1 ? 'Member' : 'Members'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete User Group"
            description="Are you sure you want to delete this user group?"
            onConfirm={() => handleDelete((record as any)._id || record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>User Group Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Create User Group
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={userGroups}
        rowKey={(record) => (record as any)._id || record.id}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} user groups`,
        }}
      />

      <Modal
        title={editingGroup ? 'Edit User Group' : 'Create User Group'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
        okText={editingGroup ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
        >
          <Form.Item
            label="Group Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter group name' },
              { min: 3, message: 'Group name must be at least 3 characters' },
              { max: 100, message: 'Group name must not exceed 100 characters' },
            ]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: 'Please enter description' },
              { max: 500, message: 'Description must not exceed 500 characters' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter group description"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="Group Admins"
            name="admins"
            tooltip="Users who can manage this group"
          >
            <Select
              mode="multiple"
              placeholder="Select group admins"
              options={users.map(user => ({
                label: `${user.username} (${user.role})`,
                value: (user as any)._id || user.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Group Members"
            name="users"
            tooltip="Users who belong to this group"
          >
            <Select
              mode="multiple"
              placeholder="Select group members"
              options={users.map(user => ({
                label: `${user.username} (${user.role})`,
                value: (user as any)._id || user.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>

      <ViewUserGroupModal
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        userGroup={viewingGroup}
      />
    </div>
  );
};

export default UserGroupManagement;
