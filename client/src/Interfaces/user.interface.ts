// User related interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  isAdmin: boolean;
  isSOLI: boolean;
  isActive: boolean;
  created: string;
  createdBy: string;
  updated?: string;
  updatedBy?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface CreateUserDto {
  username: string;
  password: string;
  isAdmin?: boolean;
  isSOLI?: boolean;
  isActive?: boolean;
  createdBy?: string;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  isAdmin?: boolean;
  isSOLI?: boolean;
  isActive?: boolean;
  updatedBy?: string;
}
