/**
 * Project interfaces
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'completed';
  isSoli: boolean;
  isDeleted: boolean;
  created: string;
  createdBy: string;
  updated?: string;
  updatedBy?: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  status?: 'active' | 'inactive' | 'completed';
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed';
}
