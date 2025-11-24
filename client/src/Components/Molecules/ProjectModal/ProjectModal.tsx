'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import type { Project, CreateProjectDto, User, UserGroup } from '@/Interfaces';
import { userService, userGroupService } from '@/Services';

const { TextArea } = Input;

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectDto) => Promise<void>;
  project?: Project | null;
  mode: 'create' | 'edit';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  open,
  onClose,
  onSubmit,
  project,
  mode,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [userGroups, setUserGroups] = React.useState<UserGroup[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, groupsResponse] = await Promise.all([
          userService.getUsers({ pageSize: 1000 }),
          userGroupService.getUserGroups({ pageSize: 1000 })
        ]);
        setUsers(usersResponse.data);
        setUserGroups(groupsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        message.error('Failed to load users or groups');
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const handleUserGroupChange = (selectedGroupIds: string[]) => {
    // Get current selections
    const currentAdmins = form.getFieldValue('admins') || [];
    const currentUsers = form.getFieldValue('users') || [];

    const newAdmins = new Set(currentAdmins);
    const newUsers = new Set(currentUsers);

    selectedGroupIds.forEach(groupId => {
      const group = userGroups.find(g => g.id === groupId || (g as any)._id === groupId);
      if (group) {
        // Add group admins
        group.admins.forEach((admin: any) => {
          const adminId = typeof admin === 'string' ? admin : (admin._id || admin.id);
          if (adminId) newAdmins.add(adminId);
        });
        // Add group members
        group.users.forEach((user: any) => {
          const userId = typeof user === 'string' ? user : (user._id || user.id);
          if (userId) newUsers.add(userId);
        });
      }
    });

    // Update form values
    form.setFieldsValue({
      admins: Array.from(newAdmins),
      users: Array.from(newUsers)
    });
  };

  useEffect(() => {
    if (open && project && mode === 'edit') {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        status: project.status,
        admins: project.admins?.map((a: any) => a._id || a.id || a) || [],
        users: project.users?.map((u: any) => u._id || u.id || u) || [],
      });
    } else if (open && mode === 'create') {
      form.resetFields();
    }
  }, [open, project, mode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit(values);
      message.success(`Project ${mode === 'create' ? 'created' : 'updated'} successfully`);
      form.resetFields();
      onClose();
    } catch (error: any) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      message.error(error?.response?.data?.message || `Failed to ${mode} project`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={mode === 'create' ? 'Create New Project' : 'Edit Project'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={mode === 'create' ? 'Create' : 'Update'}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          label="Project Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter project name' },
            { min: 3, message: 'Project name must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Enter project name" size="large" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please enter project description' },
          ]}
        >
          <TextArea
            placeholder="Enter project description"
            rows={4}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Add from User Group"
          tooltip="Select a user group to automatically add its admins and members to this project"
        >
          <Select
            mode="multiple"
            placeholder="Select user groups to add users"
            size="large"
            onChange={handleUserGroupChange}
            optionFilterProp="children"
            filterOption={(input, option: any) =>
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {userGroups.map((group) => (
              <Select.Option key={group.id || (group as any)._id} value={group.id || (group as any)._id}>
                {group.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Group Admins"
          name="admins"
          tooltip="Select users who will have admin access to this project"
        >
          <Select
            mode="multiple"
            placeholder="Select group admins"
            size="large"
            optionFilterProp="children"
            filterOption={(input, option: any) =>
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {users.map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.username})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Group Members"
          name="users"
          tooltip="Select users who will be members of this project"
        >
          <Select
            mode="multiple"
            placeholder="Select group members"
            size="large"
            optionFilterProp="children"
            filterOption={(input, option: any) =>
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {users.map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.username})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {mode === 'edit' && (
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select size="large">
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ProjectModal;
