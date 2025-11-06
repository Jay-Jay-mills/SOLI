'use client';

import React, { useState } from 'react';
import { Card, List, Button, message, Popconfirm, Progress } from 'antd';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { FileUploadZone } from '@/Components/Molecules';
import { fileService } from '@/Services';
import { useFileStore } from '@/State';
import { formatFileSize, formatRelativeTime } from '@/Helpers';
import type { FileUpload } from '@/Interfaces';

export const FileUploadContainer: React.FC = () => {
  const { files, addFile, removeFile, setUploadProgress } = useFileStore();
  const [loading, setLoading] = useState(false);

  const handleUploadSuccess = async (fileData: any) => {
    try {
      setLoading(true);
      const file = fileData.originFileObj;
      
      const response = await fileService.uploadFile(file, (progress) => {
        setUploadProgress(file.name, progress);
      });

      const newFile: FileUpload = {
        id: response.id,
        fileName: response.fileName,
        fileSize: response.size,
        fileType: file.type,
        uploadedBy: 'Current User',
        uploadedAt: new Date().toISOString(),
        status: 'completed',
        url: response.url,
      };

      addFile(newFile);
      message.success('File uploaded successfully!');
    } catch (error: any) {
      message.error(error?.message || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      removeFile(fileId);
      message.success('File deleted successfully!');
    } catch (error: any) {
      message.error('Failed to delete file');
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      await fileService.downloadFile(fileId, fileName);
      message.success('Download started!');
    } catch (error: any) {
      message.error('Failed to download file');
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Upload Files" className="shadow-soft">
        <FileUploadZone
          onUploadSuccess={handleUploadSuccess}
          onUploadError={() => message.error('Upload failed')}
        />
      </Card>

      <Card title="Uploaded Files" className="shadow-soft">
        <List
          dataSource={files}
          loading={loading}
          renderItem={(file) => (
            <List.Item
              actions={[
                <Button
                  key="download"
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(file.id, file.fileName)}
                >
                  Download
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Delete this file?"
                  onConfirm={() => handleDelete(file.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={file.fileName}
                description={`${formatFileSize(file.fileSize)} • Uploaded ${formatRelativeTime(
                  file.uploadedAt
                )}`}
              />
              {file.progress !== undefined && file.progress < 100 && (
                <Progress percent={file.progress} size="small" />
              )}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default FileUploadContainer;
