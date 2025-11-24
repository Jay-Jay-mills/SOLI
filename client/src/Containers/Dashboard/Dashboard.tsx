'use client';

import React, { useState, useEffect } from 'react';
import { Button, Empty, Spin, Popconfirm, message, Card, Row, Col, Statistic, Input, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { ProjectCard, ProjectModal } from '@/Components/Molecules';
import { useAuth } from '@/Hooks';
import { projectService } from '@/Services';
import { type Project, type CreateProjectDto, type UpdateProjectDto, UserRole } from '@/Interfaces';

const { Search } = Input;
const { Option } = Select;

export const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      message.error(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await projectService.deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      message.success('Project deleted successfully');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProject = async (data: CreateProjectDto | UpdateProjectDto) => {
    try {
      if (modalMode === 'create') {
        const newProject = await projectService.createProject(data as CreateProjectDto);
        setProjects([newProject, ...projects]);
        message.success('Project created successfully');
      } else if (selectedProject) {
        const updatedProject = await projectService.updateProject(selectedProject.id, data as UpdateProjectDto);
        setProjects(projects.map((p) => p.id === selectedProject.id ? updatedProject : p));
        message.success('Project updated successfully');
      }
      setModalOpen(false);
      setSelectedProject(null);
    } catch (error: any) {
      message.error(error?.response?.data?.message || `Failed to ${modalMode} project`);
      throw error; // Re-throw to let modal handle loading state
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f1f1f', margin: 0, letterSpacing: '-0.5px' }}>
            Dashboard
          </h1>
          <p style={{ marginTop: '8px', color: '#595959', margin: '8px 0 0 0', fontSize: '15px' }}>
            Welcome back, {user?.firstName || 'User'}! Here's what's happening with your projects.
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
            style={{
              height: '44px',
              padding: '0 24px',
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
            }}
          >
            Create Project
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px', fontWeight: '500' }}>
                  Total Projects
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff' }}>
                  {totalProjects}
                </div>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ProjectOutlined style={{ fontSize: '28px', color: '#ffffff' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px', fontWeight: '500' }}>
                  Active Projects
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff' }}>
                  {activeProjects}
                </div>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClockCircleOutlined style={{ fontSize: '28px', color: '#ffffff' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px', fontWeight: '500' }}>
                  Completed Projects
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff' }}>
                  {completedProjects}
                </div>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleOutlined style={{ fontSize: '28px', color: '#ffffff' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card
        bordered={false}
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1f1f1f', margin: 0, letterSpacing: '-0.3px' }}>
              Sales Order Projects
            </h2>
            <p style={{ fontSize: '14px', color: '#8c8c8c', margin: '6px 0 0 0' }}>
              Manage and view all your projects in one place
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Search
              placeholder="Search projects by name or description..."
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: 320,
                minWidth: 200,
                flex: '1 1 200px',
                maxWidth: '500px'
              }}
              size="large"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              size="large"
              style={{ width: 160 }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="completed">Completed</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      <Spin spinning={loading}>
        {filteredProjects.length === 0 ? (
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Empty
              description={
                <div>
                  <p style={{ color: '#262626', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    {searchQuery || statusFilter !== 'all'
                      ? 'No projects found'
                      : 'No projects yet'}
                  </p>
                  <p style={{ color: '#8c8c8c', fontSize: '14px' }}>
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first project to get started!'}
                  </p>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {isSuperAdmin && !searchQuery && statusFilter === 'all' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateProject}
                  size="large"
                  style={{ marginTop: '16px', borderRadius: '8px' }}
                >
                  Create Your First Project
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredProjects.map((project) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
                <div style={{ position: 'relative', height: '100%' }} className="project-card-wrapper">
                  <ProjectCard project={project} onClick={() => handleProjectClick(project.id)} />
                  {isSuperAdmin && (
                    <div
                      className="project-card-actions"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'flex',
                        gap: '8px',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }}
                    >
                      <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => handleEditProject(e, project)}
                        style={{ borderRadius: '6px' }}
                      />
                      <Popconfirm
                        title="Delete project"
                        description="Are you sure you want to delete this project?"
                        onConfirm={(e) => handleDeleteProject(e as any, project.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                          style={{ borderRadius: '6px' }}
                        />
                      </Popconfirm>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      <ProjectModal
        open={modalOpen}
        mode={modalMode}
        project={selectedProject}
        onSubmit={handleSubmitProject}
        onClose={() => setModalOpen(false)}
      />

      <style jsx>{`
        .project-card-wrapper:hover .project-card-actions {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
