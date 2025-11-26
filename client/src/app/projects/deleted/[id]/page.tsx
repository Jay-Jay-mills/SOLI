'use client';

import React, { useState, useEffect } from 'react';
import { Button, Spin, Card, Tag, Empty, message, Descriptions, Table, Typography, Divider } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/Hooks';
import { projectService, formService } from '@/Services';
import { type Project, type ProjectForm, type FormSubmission, UserRole } from '@/Interfaces';
import { formatDate } from '@/Helpers';
import { Layout } from 'antd';
import { Header } from '@/Layouts';

const { Content } = Layout;
const { Title, Text } = Typography;

interface DeletedProjectDetailPageProps {
    params: { id: string };
}

export default function DeletedProjectDetailPage({ params }: DeletedProjectDetailPageProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [projectForm, setProjectForm] = useState<ProjectForm | null>(null);
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

    // Redirect if not super admin
    useEffect(() => {
        if (user && !isSuperAdmin) {
            message.error('Access denied. Super admin privileges required.');
            router.push('/dashboard');
        }
    }, [user, isSuperAdmin, router]);

    // Load deleted project on mount
    useEffect(() => {
        if (isSuperAdmin && params.id) {
            loadDeletedProject();
            loadFormAndSubmissions();
        }
    }, [isSuperAdmin, params.id]);

    const loadDeletedProject = async () => {
        setLoading(true);
        try {
            const data = await projectService.getDeletedProjectById(params.id);
            setProject(data);
        } catch (error: any) {
            console.error('Error loading deleted project:', error);
            message.error(error.response?.data?.message || 'Failed to load deleted project');
            router.push('/projects/deleted');
        } finally {
            setLoading(false);
        }
    };

    const loadFormAndSubmissions = async () => {
        setFormLoading(true);
        try {
            // Load form
            const form = await formService.getFormByProjectId(params.id);
            setProjectForm(form);

            // Load submissions if form exists
            if (form) {
                setSubmissionsLoading(true);
                const subs = await formService.getFormSubmissions(form.id);
                setSubmissions(subs);
            }
        } catch (error: any) {
            console.error('Error loading form and submissions:', error);
            // Don't show error if form not found (404), just means no form exists
            if (error.response?.status !== 404) {
                message.error(error.response?.data?.message || 'Failed to load form data');
            }
        } finally {
            setFormLoading(false);
            setSubmissionsLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/projects/deleted');
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'completed':
                return 'blue';
            case 'inactive':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status?: string) => {
        const statusLabels: Record<string, string> = {
            active: 'ACTIVE',
            inactive: 'INACTIVE',
            completed: 'COMPLETED',
        };
        return statusLabels[status || ''] || (status ? status.toUpperCase() : 'UNKNOWN');
    };

    // Generate table columns from form fields
    const getTableColumns = () => {
        if (!projectForm) return [];

        return projectForm.fields.map((field) => ({
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
    };

    if (!isSuperAdmin) {
        return null;
    }

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                <Header />
                <Content style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 64px)',
                    width: '100%'
                }}>
                    <Spin size="large" />
                </Content>
            </Layout>
        );
    }

    if (!project) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                <Header />
                <Content style={{
                    padding: '32px 48px',
                    maxWidth: '1600px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <Empty description="Project not found" />
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Header />
            <Content style={{
                padding: '32px 48px',
                maxWidth: '1600px',
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Back Button */}
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBack}
                        size="large"
                        style={{ borderRadius: '8px', width: 'fit-content' }}
                    >
                        Back to Dashboard
                    </Button>

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
                                            {getStatusLabel(project.status)}
                                        </Tag>
                                    </div>
                                    <p style={{ color: '#595959', fontSize: '16px', margin: 0 }}>
                                        {project.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Project Details */}
                    <Card
                        title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Project Details</span>}
                        style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                    >
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Project Name">
                                {project.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Description">
                                {project.description || 'No description provided'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={getStatusColor(project.status)}>
                                    {getStatusLabel(project.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Created Date">
                                {formatDate(project.created)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Deleted Date">
                                {formatDate(project.updated || project.created)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Form Data Section */}
                    {formLoading ? (
                        <Card style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                                <Spin size="large" tip="Loading form data..." />
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
                                            No data entries found for this project.
                                        </span>
                                    }
                                    style={{ padding: '48px 0' }}
                                />
                            )}
                        </Card>
                    )}

                    {/* No data entries message (only if no form exists) */}
                    {!formLoading && !projectForm && (
                        <Card
                            title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Data Entries</span>}
                            style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                        >
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <p style={{ color: '#262626', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                                            No form data
                                        </p>
                                        <p style={{ color: '#8c8c8c', fontSize: '14px', margin: 0 }}>
                                            This project did not have any form data associated with it.
                                        </p>
                                    </div>
                                }
                                style={{ padding: '48px 0' }}
                            />
                        </Card>
                    )}
                </div>
            </Content>
        </Layout>
    );
}
