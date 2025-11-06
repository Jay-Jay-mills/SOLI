import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/Constants';
import type { FileUpload, UploadFileResponse, PaginatedResponse } from '@/Interfaces';

/**
 * File service module
 */
export const fileService = {
  /**
   * Upload file
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.post<UploadFileResponse>(
      API_ENDPOINTS.UPLOAD_FILE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Get all files
   */
  async getFiles(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<FileUpload>> {
    const response = await apiService.get<PaginatedResponse<FileUpload>>(API_ENDPOINTS.FILES, {
      params,
    });
    return response.data;
  },

  /**
   * Get file by ID
   */
  async getFileById(id: string): Promise<FileUpload> {
    const response = await apiService.get<FileUpload>(API_ENDPOINTS.FILE_BY_ID(id));
    return response.data;
  },

  /**
   * Delete file
   */
  async deleteFile(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.DELETE_FILE(id));
  },

  /**
   * Download file
   */
  async downloadFile(id: string, filename: string): Promise<void> {
    const response = await apiService.get(API_ENDPOINTS.DOWNLOAD_FILE(id), {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default fileService;
