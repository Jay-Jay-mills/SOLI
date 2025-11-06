/**
 * Project interfaces
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  created: string;
  updated: string;
  status: 'active' | 'inactive' | 'completed';
}

export interface CreateProjectDto {
  name: string;
  description: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed';
}
