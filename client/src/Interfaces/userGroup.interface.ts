// UserGroup related interfaces
import { User } from './user.interface';

export interface UserGroup {
  id: string;
  _id?: string;
  name: string;
  description: string;
  admins: (string | User)[];
  users: (string | User)[];
  isActive: boolean;
  created: string;
  createdBy: string;
  updated?: string;
  updatedBy?: string;
}

export interface CreateUserGroupDto {
  name: string;
  description: string;
  admins?: string[];
  users?: string[];
  isActive?: boolean;
}

export interface UpdateUserGroupDto {
  name?: string;
  description?: string;
  admins?: string[];
  users?: string[];
  isActive?: boolean;
}

export interface GetUserGroupsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface UserGroupResponse {
  success: boolean;
  data: UserGroup;
  message?: string;
}

export interface UserGroupsResponse {
  success: boolean;
  data: UserGroup[];
  message?: string;
}
