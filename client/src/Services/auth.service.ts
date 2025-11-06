import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/Constants';
import type {
  LoginCredentials,
  LoginResponse,
  GetMeResponse,
} from '@/Interfaces';

/**
 * Authentication service module
 */
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  /**
   * Get current user
   */
  async getMe(): Promise<GetMeResponse> {
    const response = await apiService.get<GetMeResponse>(API_ENDPOINTS.USER_PROFILE);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiService.post(API_ENDPOINTS.LOGOUT);
  },
};

export default authService;
