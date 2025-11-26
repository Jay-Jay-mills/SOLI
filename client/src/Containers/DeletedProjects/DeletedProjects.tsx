'use client';

import React, { useState, useEffect } from 'react';
import { Button, Empty, Popconfirm, message, Table, Space, Tag } from 'antd';
import { RollbackOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/Hooks';
import { projectService } from '@/Services';
import { type Project, UserRole } from '@/Interfaces';
import { formatDate } from '@/Helpers';
import type { ColumnsType } from 'antd/es/table';

export const DeletedProjects: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

    // Redirect if not super admin
    useEffect(() => {
        if (user && !isSuperAdmin) {
            message.error('Access denied. Super admin privileges required.');
            router.push('/dashboard');
        }
    }, [user, isSuperAdmin, router]);

    // Load deleted projects on mount
    useEffect(() => {
        if (isSuperAdmin) {
            loadDeletedProjects();
        }
    }, [isSuperAdmin]);

    const loadDeletedProjects = async () => {
        setLoading(true);
        try {
            const data = await projectService.getDeletedProjects();
            setProjects(data);
        } catch (error: any) {
            console.error('Error loading deleted projects:', error);
            message.error(error.response?.data?.message || 'Failed to load deleted projects');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (projectId: string) => {
        try {
            setLoading(true);
            await projectService.restoreProject(projectId);
            setProjects(projects.filter((p) => p.id !== projectId));
            message.success('Project restored successfully');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to restore project');
        } finally {
            setLoading(false);
        }
    };

    const handlePermanentDelete = async (projectId: string) => {
        try {
            setLoading(true);
            await projectService.permanentlyDeleteProject(projectId);
            setProjects(projects.filter((p) => p.id !== projectId));
            message.success('Project permanently deleted');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to permanently delete project');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<Project> = [
        {
            title: 'Project Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusColors: Record<string, string> = {
                    active: 'green',
                    inactive: 'red',
                    completed: 'blue',
                };
                const statusLabels: Record<string, string> = {
                    active: 'ACTIVE',
                    inactive: 'INACTIVE',
                    completed: 'COMPLETED',
                };
                return (
                    <Tag color={statusColors[status] || 'blue'}>
                        {statusLabels[status] || (status ? status.toUpperCase() : 'UNKNOWN')}
                    </Tag>
                );
            },
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
                { text: 'Completed', value: 'completed' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Deleted Date',
            dataIndex: 'updated',
            key: 'updated',
            render: (date: string) => formatDate(date),
            sorter: (a, b) => new Date(a.updated || a.created).getTime() - new Date(b.updated || b.created).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Popconfirm
                        title="Restore this project?"
                        onConfirm={() => handleRestore(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" icon={<RollbackOutlined />}>
                            Restore
                        </Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Delete this project permanently?"
                        description="This action cannot be undone."
                        onConfirm={() => handlePermanentDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete Forever
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/dashboard')}
                style={{ marginBottom: '16px' }}
            >
                Back to Dashboard
            </Button>

            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Deleted Projects</h2>
            </div>

            <Table
                columns={columns}
                dataSource={projects}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                onRow={(record) => ({
                    onClick: () => router.push(`/projects/deleted/${record.id}`),
                    style: { cursor: 'pointer' },
                })}
                locale={{
                    emptyText: (
                        <Empty
                            description={
                                <div>
                                    <p style={{ color: '#262626', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                                        No deleted projects
                                    </p>
                                    <p style={{ color: '#8c8c8c', fontSize: '14px', margin: 0 }}>
                                        Deleted projects will appear here
                                    </p>
                                </div>
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ),
                }}
            />
        </div>
    );
};
