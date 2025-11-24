import apiClient from './api.service';
import type { 
  UserGroup, 
  CreateUserGroupDto, 
  UpdateUserGroupDto, 
  GetUserGroupsParams,
  UserGroupResponse,
  UserGroupsResponse
} from '@/Interfaces';

const BASE_URL = '/usergroups';

export const userGroupService = {
  /**
   * Get all user groups
   */
  getUserGroups: async (params?: GetUserGroupsParams): Promise<UserGroupsResponse> => {
    const response = await apiClient.get<UserGroupsResponse>(BASE_URL, { params });
    return response.data;
  },

  /**
   * Get user group by ID
   */
  getUserGroupById: async (id: string): Promise<UserGroupResponse> => {
    const response = await apiClient.get<UserGroupResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new user group
   */
  createUserGroup: async (data: CreateUserGroupDto): Promise<UserGroupResponse> => {
    const response = await apiClient.post<UserGroupResponse>(BASE_URL, data);
    return response.data;
  },

  /**
   * Update user group
   */
  updateUserGroup: async (id: string, data: UpdateUserGroupDto): Promise<UserGroupResponse> => {
    const response = await apiClient.put<UserGroupResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete user group
   */
  deleteUserGroup: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Add users to group
   */
  addUsersToGroup: async (id: string, userIds: string[]): Promise<UserGroupResponse> => {
    const response = await apiClient.post<UserGroupResponse>(`${BASE_URL}/${id}/users`, { userIds });
    return response.data;
  },

  /**
   * Remove users from group
   */
  removeUsersFromGroup: async (id: string, userIds: string[]): Promise<UserGroupResponse> => {
    const response = await apiClient.delete<UserGroupResponse>(`${BASE_URL}/${id}/users`, { data: { userIds } });
    return response.data;
  },
};

export default userGroupService;
