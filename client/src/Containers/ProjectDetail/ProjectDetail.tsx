'use client';

import React, { useState, useEffect } from 'react';
import { Button, Spin, Card, Tag, Space, message, Table, Popconfirm, Typography, Empty, Divider } from 'antd';
import { 
  ArrowLeftOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/Hooks';
import { ROUTES } from '@/Constants';
import { FormBuilderModal, DataEntryModal } from '@/Components/Molecules';
import { formService, projectService } from '@/Services';
import type { Project, ProjectForm, FormSubmission, CreateFormDto } from '@/Interfaces';

const { Title, Text } = Typography;

interface ProjectDetailProps {
  projectId: string;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  useEffect(() => {
    loadProject();
    loadFormAndSubmissions();
  }, [projectId]);

  /**
   * Load project from API
   */
  const loadProject = async () => {
    try {
      const projectData = await projectService.getProjectById(projectId);
      setProject(projectData);
    } catch (error: any) {
      console.error('Error loading project:', error);
      message.error(error.response?.data?.message || 'Failed to load project');
    }
  };

  /**
   * Load form and submissions from API
   */
  const loadFormAndSubmissions = async () => {
    setFormLoading(true);
    try {
      // Load form
      const form = await formService.getFormByProjectId(projectId);
      setProjectForm(form);

      // Load submissions if form exists
      if (form) {
        setSubmissionsLoading(true);
        const subs = await formService.getFormSubmissions(form.id);
        setSubmissions(subs);
      }
    } catch (error: any) {
      console.error('Error loading form and submissions:', error);
      if (error.response?.status !== 404) {
        message.error(error.response?.data?.message || 'Failed to load form data');
      }
    } finally {
      setFormLoading(false);
      setSubmissionsLoading(false);
    }
  };

  const handleBack = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const handleCreateForm = () => {
    setIsFormBuilderOpen(true);
  };

  const handleFormSubmit = async (formData: { name: string; description?: string; fields: any[] }) => {
    try {
      const formPayload: CreateFormDto = {
        projectId,
        name: formData.name,
        description: formData.description,
        fields: formData.fields.map(({ id, ...field }) => field),
      };

      let savedForm: ProjectForm;

      if (projectForm) {
        // Update existing form
        savedForm = await formService.updateForm(projectForm.id, formPayload);
        message.success('Form updated successfully!');
      } else {
        // Create new form
        savedForm = await formService.createForm(formPayload);
        message.success('Form created successfully!');
      }

      setProjectForm(savedForm);
      setIsFormBuilderOpen(false);
    } catch (error: any) {
      console.error('Error saving form:', error);
      message.error(error.response?.data?.message || 'Failed to save form');
    }
  };

  const handleAddEntry = () => {
    setEditingSubmission(null);
    setIsDataEntryOpen(true);
  };

  const handleEditEntry = (submission: FormSubmission) => {
    setEditingSubmission(submission);
    setIsDataEntryOpen(true);
  };

  const handleDeleteEntry = async (submissionId: string) => {
    try {
      await formService.deleteSubmission(submissionId);
      setSubmissions(submissions.filter((s) => s.id !== submissionId));
      message.success('Entry deleted successfully');
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      message.error(error.response?.data?.message || 'Failed to delete entry');
    }
  };

  const handleDataEntrySubmit = async (data: Record<string, any>, files?: Record<string, File[]>) => {
    if (!projectForm) return;

    try {
      if (editingSubmission) {
        // Update existing submission
        const updated = await formService.updateSubmission(editingSubmission.id, data, files);
        setSubmissions(
          submissions.map((s) =>
            s.id === updated.id ? updated : s
          )
        );
        message.success('Entry updated successfully');
      } else {
        // Create new submission
        const newSubmission = await formService.submitFormData(projectForm.id, data, files);
        setSubmissions([...submissions, newSubmission]);
        message.success('Entry submitted successfully');
      }
      setIsDataEntryOpen(false);
      setEditingSubmission(null);
    } catch (error: any) {
      console.error('Error submitting data:', error);
      message.error(error.response?.data?.message || 'Failed to submit entry');
    }
  };

  // Generate table columns from form fields
  const getTableColumns = () => {
    if (!projectForm) return [];

    const dataColumns = projectForm.fields.map((field) => ({
      title: field.label,
      dataIndex: ['data', field.name],
      key: field.name,
      ellipsis: true,
      render: (value: any) => {
        if (field.type === 'date' && value) {
          return new Date(value).toLocaleDateString();
        }
        if (field.type === 'file' && value) {
          if (Array.isArray(value) && value.length > 0) {
            return value.map((file: any, index: number) => {
              // Extract relative path from full path (remove 'uploads/' prefix if present)
              const relativePath = file.path ? file.path.replace(/^uploads[\\/]/, '') : file.filename;
              const fileUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/uploads/${relativePath}`;
              
              return (
                <a 
                  key={index}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginRight: '8px', display: 'block' }}
                >
                  📎 {file.originalName || file.filename}
                </a>
              );
            });
          }
          return '-';
        }
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value || '-';
      },
    }));

    const actionColumn = {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: FormSubmission) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditEntry(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this entry?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteEntry(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    };

    return [...dataColumns, actionColumn];
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  if (!project) {
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        width: '100%'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back Button and Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          size="large"
          style={{ borderRadius: '8px' }}
        >
          Back to Dashboard
        </Button>
        {isAdmin && !projectForm && !formLoading && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateForm}
            size="large"
            style={{ borderRadius: '8px' }}
          >
            Create Form
          </Button>
        )}
        {projectForm && (
          <Space>
            <Tag color="green" style={{ fontSize: '14px', padding: '6px 12px' }}>
              Form Created: {projectForm.name}
            </Tag>
            {isAdmin && (
              <Button
                icon={<EditOutlined />}
                onClick={handleCreateForm}
                style={{ borderRadius: '8px' }}
              >
                Edit Form
              </Button>
            )}
          </Space>
        )}
      </div>

      {/* Project Header */}
      <Card style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#262626', margin: 0 }}>
                  {project.name}
                </h1>
                <Tag color={getStatusColor(project.status)} style={{ fontSize: '13px', padding: '4px 12px' }}>
                  {project.status?.toUpperCase()}
                </Tag>
              </div>
              <p style={{ color: '#595959', fontSize: '16px', margin: 0 }}>
                {project.description}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Entry Section - Only show if form is created */}
      {formLoading ? (
        <Card style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Spin size="large" tip="Loading form..." />
          </div>
        </Card>
      ) : projectForm && (
        <Card 
          style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileTextOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {projectForm.name}
                </Title>
                {projectForm.description && (
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {projectForm.description}
                  </Text>
                )}
              </div>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddEntry}
              size="large"
              style={{ borderRadius: '8px' }}
            >
              Add Entry
            </Button>
          }
        >
          <Divider style={{ margin: '16px 0' }} />
          
          {/* Data Table */}
          {submissionsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <Spin size="large" tip="Loading entries..." />
            </div>
          ) : submissions.length > 0 ? (
            <Table
              columns={getTableColumns()}
              dataSource={submissions}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} entries`,
              }}
              bordered
              style={{ marginTop: '16px' }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#8c8c8c' }}>
                  No data entries yet. Click "Add Entry" to submit your first record.
                </span>
              }
              style={{ padding: '48px 0' }}
            />
          )}
        </Card>
      )}

      {/* Form Builder Modal */}
      {isAdmin && (
        <FormBuilderModal
          open={isFormBuilderOpen}
          onCancel={() => setIsFormBuilderOpen(false)}
          onSubmit={handleFormSubmit}
          projectId={projectId}
          projectName={project.name}
          existingForm={projectForm}
        />
      )}

      {/* Data Entry Modal */}
      {projectForm && (
        <DataEntryModal
          open={isDataEntryOpen}
          onCancel={() => {
            setIsDataEntryOpen(false);
            setEditingSubmission(null);
          }}
          onSubmit={handleDataEntrySubmit}
          formFields={projectForm.fields}
          formName={projectForm.name}
          editingData={editingSubmission}
        />
      )}
    </div>
  );
};

export default ProjectDetail;

