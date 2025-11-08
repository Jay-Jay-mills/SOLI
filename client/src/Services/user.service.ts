import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/Constants';
import type { User, CreateUserDto, UpdateUserDto, PaginatedResponse } from '@/Interfaces';

/**
 * User service module
 */
export const userService = {
  /**
   * Get all users with pagination
   */
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await apiService.get<any>(API_ENDPOINTS.USERS, {
      params,
    });
    // Backend returns { success, data: { users, pagination } }
    if (response.data?.success && response.data?.data) {
      const paginationData = response.data.data.pagination || {};
      return {
        data: response.data.data.users || [],
        total: paginationData.total || 0,
        page: paginationData.page || 1,
        pageSize: paginationData.limit || 10,
        totalPages: paginationData.pages || 1,
      };
    }
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiService.get<User>(API_ENDPOINTS.USER_BY_ID(id));
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>(API_ENDPOINTS.USER_PROFILE);
    return response.data;
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserDto): Promise<User> {
    const response = await apiService.post<any>(API_ENDPOINTS.USERS, data);
    // Backend returns { success, message, data: User }
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await apiService.put<any>(API_ENDPOINTS.UPDATE_USER(id), data);
    // Backend returns { success, message, data: User }
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.DELETE_USER(id));
  },
};

export default userService;
