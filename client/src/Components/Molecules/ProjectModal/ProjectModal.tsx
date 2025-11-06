'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import type { Project, CreateProjectDto } from '@/Interfaces';

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

  useEffect(() => {
    if (open && project && mode === 'edit') {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        status: project.status,
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
