import { create } from 'zustand';
import type { FileUpload } from '@/Interfaces';

interface FileStore {
  files: FileUpload[];
  uploadProgress: Record<string, number>;
  isUploading: boolean;
  
  // Actions
  setFiles: (files: FileUpload[]) => void;
  addFile: (file: FileUpload) => void;
  removeFile: (id: string) => void;
  setUploadProgress: (fileId: string, progress: number) => void;
  clearUploadProgress: (fileId: string) => void;
  setUploading: (isUploading: boolean) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  uploadProgress: {},
  isUploading: false,

  setFiles: (files) => {
    set({ files });
  },

  addFile: (file) => {
    set((state) => ({
      files: [...state.files, file],
    }));
  },

  removeFile: (id) => {
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
    }));
  },

  setUploadProgress: (fileId, progress) => {
    set((state) => ({
      uploadProgress: {
        ...state.uploadProgress,
        [fileId]: progress,
      },
    }));
  },

  clearUploadProgress: (fileId) => {
    set((state) => {
      const { [fileId]: _, ...rest } = state.uploadProgress;
      return { uploadProgress: rest };
    });
  },

  setUploading: (isUploading) => {
    set({ isUploading });
  },
}));

export default useFileStore;
