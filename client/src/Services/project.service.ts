import { apiService } from './api.service';
import type { ApiResponse } from '@/Interfaces';
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/Interfaces';

/**
 * Project-related API calls
 */
class ProjectService {
  private readonly BASE_PATH = '/projects';

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    const response = await apiService.get<ApiResponse<Project[]>>(`${this.BASE_PATH}`);
    return response.data.data;
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: 'active' | 'inactive' | 'completed'): Promise<Project[]> {
    const response = await apiService.get<ApiResponse<Project[]>>(`${this.BASE_PATH}/status/${status}`);
    return response.data.data;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string): Promise<Project> {
    const response = await apiService.get<ApiResponse<Project>>(`${this.BASE_PATH}/${projectId}`);
    return response.data.data;
  }

  /**
   * Create new project
   */
  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await apiService.post<ApiResponse<Project>>(`${this.BASE_PATH}`, data);
    return response.data.data;
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, data: UpdateProjectDto): Promise<Project> {
    const response = await apiService.put<ApiResponse<Project>>(`${this.BASE_PATH}/${projectId}`, data);
    return response.data.data;
  }

  /**
   * Delete project (soft delete)
   */
  async deleteProject(projectId: string): Promise<void> {
    await apiService.delete<ApiResponse<void>>(`${this.BASE_PATH}/${projectId}`);
  }

  /**
   * Get deleted projects (super admin only)
   */
  async getDeletedProjects(): Promise<Project[]> {
    const response = await apiService.get<ApiResponse<Project[]>>(`${this.BASE_PATH}/deleted`);
    return response.data.data;
  }

  /**
   * Get deleted project by ID (super admin only)
   */
  async getDeletedProjectById(projectId: string): Promise<Project> {
    const response = await apiService.get<ApiResponse<Project>>(`${this.BASE_PATH}/deleted/${projectId}`);
    return response.data.data;
  }


  /**
   * Restore deleted project (super admin only)
   */
  async restoreProject(projectId: string): Promise<Project> {
    const response = await apiService.put<ApiResponse<Project>>(`${this.BASE_PATH}/${projectId}/restore`, {});
    return response.data.data;
  }

  /**
   * Permanently delete project (super admin only)
   */
  async permanentlyDeleteProject(projectId: string): Promise<void> {
    await apiService.delete<ApiResponse<void>>(`${this.BASE_PATH}/${projectId}/permanent`);
  }
}

export const projectService = new ProjectService();
export default projectService;
