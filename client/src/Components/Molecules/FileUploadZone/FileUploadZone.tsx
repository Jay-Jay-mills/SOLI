'use client';

import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { APP_CONFIG } from '@/Constants';

const { Dragger } = Upload;

interface FileUploadProps {
  onUploadSuccess?: (file: any) => void;
  onUploadError?: (error: any) => void;
  accept?: string;
  maxSize?: number;
}

export const FileUploadZone: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept = APP_CONFIG.ALLOWED_FILE_TYPES.join(','),
  maxSize = APP_CONFIG.MAX_FILE_SIZE,
}) => {
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept,
    beforeUpload: (file) => {
      const isAllowed = APP_CONFIG.ALLOWED_FILE_TYPES.includes(file.type);
      if (!isAllowed) {
        message.error(`${file.name} is not a supported file type`);
        return false;
      }

      const isValidSize = file.size <= maxSize;
      if (!isValidSize) {
        message.error(`File must be smaller than ${maxSize / 1024 / 1024}MB`);
        return false;
      }

      return true;
    },
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
        onUploadSuccess?.(info.file);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        onUploadError?.(info.file);
      }
    },
  };

  return (
    <Dragger {...uploadProps} className="rounded-lg">
      <p className="ant-upload-drag-icon">
        <InboxOutlined className="text-6xl text-primary" />
      </p>
      <p className="ant-upload-text text-lg font-semibold">
        Click or drag file to this area to upload
      </p>
      <p className="ant-upload-hint text-neutral-500">
        Support for a single upload. Maximum file size: {maxSize / 1024 / 1024}MB
      </p>
    </Dragger>
  );
};

export default FileUploadZone;
