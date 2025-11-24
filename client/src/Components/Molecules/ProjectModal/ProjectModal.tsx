'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { Project, CreateProjectDto, User, UserGroup, UserRole } from '@/Interfaces';
import { userService, userGroupService } from '@/Services';
import { useAuth } from '@/Hooks';

const { TextArea } = Input;

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectDto) => Promise<void>;
  project?: Project | null;
  mode: 'create' | 'edit';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ open, onClose, onSubmit, project, mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [userGroups, setUserGroups] = React.useState<UserGroup[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

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
    const currentAdmins = form.getFieldValue('admins') || [];
    const currentUsers = form.getFieldValue('users') || [];
    const newAdmins = new Set(currentAdmins);
    const newUsers = new Set(currentUsers);
    selectedGroupIds.forEach(groupId => {
      const group = userGroups.find(g => g.id === groupId || (g as any)._id === groupId);
      if (group) {
        group.admins.forEach((admin: any) => {
          const adminId = typeof admin === 'string' ? admin : admin._id || admin.id;
          if (adminId) newAdmins.add(adminId);
        });
        group.users.forEach((member: any) => {
          const memberId = typeof member === 'string' ? member : member._id || member.id;
          if (memberId) newUsers.add(memberId);
        });
      }
    });
    form.setFieldsValue({ admins: Array.from(newAdmins), users: Array.from(newUsers) });
  };

  useEffect(() => {
    if (open && project && mode === 'edit') {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        status: project.status,
        admins: project.admins?.map(a => (a as any)._id || (a as any).id || a) || [],
        users: project.users?.map(u => (u as any)._id || (u as any).id || u) || []
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
      if (error.errorFields) return;
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
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item label="Project Name" name="name" rules={[{ required: true, message: 'Please enter project name' }, { min: 3, message: 'Project name must be at least 3 characters' }]}>
          <Input placeholder="Enter project name" size="large" disabled={isAdmin && !isSuperAdmin} />
        </Form.Item>
        <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please enter project description' }]}>
          <TextArea placeholder="Enter project description" rows={4} size="large" disabled={isAdmin && !isSuperAdmin} />
        </Form.Item>
        <Form.Item label="Add from User Group" tooltip="Select a user group to automatically add its admins and members to this project">
          <Select mode="multiple" placeholder="Select user groups to add users" size="large" onChange={handleUserGroupChange} optionFilterProp="children" filterOption={(input, option: any) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
            {userGroups.map(group => (
              <Select.Option key={group.id || (group as any)._id} value={group.id || (group as any)._id}>
                {group.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {/* Group Admins – only visible to Super Admin */}
        {isSuperAdmin && (
          <Form.Item label="Project Admins" name="admins" tooltip="Select users who will have admin access to this project">
            <Select
              mode="multiple"
              placeholder="Select project admins"
              size="large"
              showSearch
              filterOption={(input, option: any) => option?.label?.toLowerCase().includes(input.toLowerCase())}
              options={users
                .filter(u => u.role === UserRole.ADMIN)
                .map(u => ({ label: `${u.username} (${u.role})`, value: u.id }))}
            />
          </Form.Item>
        )}
        {/* Group Members – visible to both Super Admin and Admin (Admin can only manage members) */}
        <Form.Item label="Project Members" name="users" tooltip="Select users who will be members of this project">
          <Select
            mode="multiple"
            placeholder="Select project members"
            size="large"
            showSearch
            filterOption={(input, option: any) => option?.label?.toLowerCase().includes(input.toLowerCase())}
            options={users
              .filter(u => u.role === UserRole.USER)
              .map(u => ({ label: `${u.username} (${u.role})`, value: u.id }))}
          />
        </Form.Item>
        {mode === 'edit' && (
          <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select status' }]}>
            <Select size="large" disabled={isAdmin && !isSuperAdmin}>
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
