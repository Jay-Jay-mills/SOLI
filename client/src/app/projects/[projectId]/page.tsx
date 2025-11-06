'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Spin, Card, Tag, Row, Col, Descriptions, Tabs, Timeline, Empty, Divider, Avatar, Space } from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Header } from '@/Layouts';
import { useProtectedRoute, useAuth } from '@/Hooks';
import { ROUTES } from '@/Constants';
import type { Project } from '@/Interfaces';

const { Content } = Layout;
const { TabPane } = Tabs;

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  useProtectedRoute();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  useEffect(() => {
    // TODO: Replace with actual API call
    // Mock data for now
    const mockProject: Project = {
      id: params.projectId,
      name: `Project ${params.projectId === '1' ? 'Alpha' : params.projectId === '2' ? 'Beta' : 'Gamma'}`,
      description: params.projectId === '1' 
        ? 'Initial project setup and configuration for the new enterprise system.' 
        : params.projectId === '2'
        ? 'Development of the core API services and database schema.'
        : 'UI/UX design and frontend implementation for the dashboard.',
      createdBy: 'Admin User',
      created: '2024-01-15T10:00:00Z',
      updated: '2024-01-20T15:30:00Z',
      status: params.projectId === '3' ? 'completed' : 'active',
    };
    setProject(mockProject);
  }, [params.projectId]);

  const handleBack = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit project');
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete project');
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
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Header />
        <Content style={{ 
          padding: '32px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%'
        }}>
          <Spin size="large" />
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
            {isAdmin && (
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  Edit Project
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  Delete
                </Button>
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

              <Divider style={{ margin: '16px 0' }} />

              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#595959' }}>
                    <UserOutlined style={{ fontSize: '18px' }} />
                    <div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Created By</div>
                      <div style={{ fontWeight: 500 }}>{project.createdBy}</div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#595959' }}>
                    <CalendarOutlined style={{ fontSize: '18px' }} />
                    <div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Created On</div>
                      <div style={{ fontWeight: 500 }}>
                        {new Date(project.created).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#595959' }}>
                    <ClockCircleOutlined style={{ fontSize: '18px' }} />
                    <div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Last Updated</div>
                      <div style={{ fontWeight: 500 }}>
                        {new Date(project.updated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#595959' }}>
                    <TeamOutlined style={{ fontSize: '18px' }} />
                    <div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Team Members</div>
                      <div style={{ fontWeight: 500 }}>5 Members</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          {/* Tabbed Content */}
          <Card style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Tabs defaultActiveKey="overview" size="large">
              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    Overview
                  </span>
                }
                key="overview"
              >
                <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                  <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
                    <Descriptions.Item label="Project ID">{project.id}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={getStatusColor(project.status)}>{project.status?.toUpperCase()}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created By">{project.createdBy}</Descriptions.Item>
                    <Descriptions.Item label="Created Date">
                      {new Date(project.created).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Modified">
                      {new Date(project.updated).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Priority">
                      <Tag color="orange">HIGH</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Description" span={2}>
                      {project.description}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Team
                  </span>
                }
                key="team"
              >
                <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                  <Row gutter={[16, 16]}>
                    {[1, 2, 3, 4, 5].map((member) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={member}>
                        <Card style={{ 
                          textAlign: 'center', 
                          borderRadius: '8px',
                          transition: 'box-shadow 0.3s ease',
                          cursor: 'pointer'
                        }}>
                          <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: '12px' }} />
                          <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Team Member {member}</h4>
                          <p style={{ fontSize: '14px', color: '#8c8c8c', margin: 0 }}>Developer</p>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    Activity
                  </span>
                }
                key="activity"
              >
                <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                  <Timeline
                    items={[
                      {
                        color: 'green',
                        children: (
                          <>
                            <p style={{ fontWeight: 500, margin: 0 }}>Project created</p>
                            <p style={{ fontSize: '14px', color: '#8c8c8c', margin: 0 }}>
                              {new Date(project.created).toLocaleString()}
                            </p>
                          </>
                        ),
                      },
                      {
                        color: 'blue',
                        children: (
                          <>
                            <p style={{ fontWeight: 500, margin: 0 }}>Initial configuration completed</p>
                            <p style={{ fontSize: '14px', color: '#8c8c8c', margin: 0 }}>2 days ago</p>
                          </>
                        ),
                      },
                      {
                        color: 'blue',
                        children: (
                          <>
                            <p style={{ fontWeight: 500, margin: 0 }}>Team members assigned</p>
                            <p style={{ fontSize: '14px', color: '#8c8c8c', margin: 0 }}>5 days ago</p>
                          </>
                        ),
                      },
                      {
                        children: (
                          <>
                            <p style={{ fontWeight: 500, margin: 0 }}>Project last updated</p>
                            <p style={{ fontSize: '14px', color: '#8c8c8c', margin: 0 }}>
                              {new Date(project.updated).toLocaleString()}
                            </p>
                          </>
                        ),
                      },
                    ]}
                  />
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <SettingOutlined />
                    Settings
                  </span>
                }
                key="settings"
              >
                <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                  <Empty description="Project settings will be available soon" />
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
