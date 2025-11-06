// File upload interfaces
export interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  status: FileUploadStatus;
  url?: string;
  progress?: number;
}

export enum FileUploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface UploadFileRequest {
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadFileResponse {
  id: string;
  fileName: string;
  url: string;
  size: number;
}
