// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_PROFILE: '/auth/me', // Updated to match backend /api/auth/me
  UPDATE_USER: (id: string) => `/users/${id}`,
  DELETE_USER: (id: string) => `/users/${id}`,

  // Files
  UPLOAD_FILE: '/files/upload',
  FILES: '/files',
  FILE_BY_ID: (id: string) => `/files/${id}`,
  DELETE_FILE: (id: string) => `/files/${id}`,
  DOWNLOAD_FILE: (id: string) => `/files/${id}/download`,
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
export const SIGNALR_HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || 'http://localhost:8080/hub';
