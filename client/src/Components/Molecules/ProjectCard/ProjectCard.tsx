'use client';

import React from 'react';
import { Card, Tag, Progress } from 'antd';
import { ClockCircleOutlined, UserOutlined, FolderOutlined } from '@ant-design/icons';
import type { Project } from '@/Interfaces';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const getStatusColor = (status: string) => {
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

  // Mock progress percentage based on status
  const getProgress = (status: string) => {
    switch (status) {
      case 'active':
        return 65;
      case 'completed':
        return 100;
      case 'inactive':
        return 0;
      default:
        return 0;
    }
  };

  const progress = getProgress(project.status);

  return (
    <Card
      hoverable
      onClick={onClick}
      bordered={false}
      style={{
        height: '100%',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: '1px solid #f0f0f0'
      }}
      bodyStyle={{ padding: '20px' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = '#1890ff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#f0f0f0';
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header with icon and status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: project.status === 'completed' 
              ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            <FolderOutlined style={{ color: '#ffffff', fontSize: '22px' }} />
          </div>
          <Tag 
            color={getStatusColor(project.status)}
            style={{ 
              borderRadius: '6px',
              padding: '4px 12px',
              fontWeight: '600',
              fontSize: '11px',
              border: 'none'
            }}
          >
            {project.status.toUpperCase()}
          </Tag>
        </div>

        {/* Project Name */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1f1f1f',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.3px'
        }}>
          {project.name}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: '#595959',
          margin: 0,
          minHeight: '42px',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {project.description}
        </p>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: '500' }}>Progress</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f1f1f' }}>{progress}%</span>
          </div>
          <Progress 
            percent={progress} 
            showInfo={false} 
            strokeColor={
              project.status === 'completed' 
                ? { '0%': '#4facfe', '100%': '#00f2fe' }
                : { '0%': '#667eea', '100%': '#764ba2' }
            }
            trailColor="#f0f0f0"
            strokeWidth={8}
          />
        </div>

        {/* Footer with metadata */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f0f0f0',
          paddingTop: '14px',
          fontSize: '13px',
          color: '#8c8c8c'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <UserOutlined style={{ fontSize: '13px' }} />
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '120px',
              fontWeight: '500'
            }}>
              {project.createdBy}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClockCircleOutlined style={{ fontSize: '13px' }} />
            <span style={{ fontWeight: '500' }}>
              {new Date(project.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
