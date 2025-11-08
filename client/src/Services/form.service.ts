import { apiService } from './api.service';
import type { ApiResponse } from '@/Interfaces';
import type { ProjectForm, CreateFormDto, FormSubmission, FormField } from '@/Interfaces';

/**
 * Form-related API calls
 */
class FormService {
  private readonly BASE_PATH = '/forms';

  /**
   * Create a new form for a project
   */
  async createForm(data: CreateFormDto): Promise<ProjectForm> {
    const response = await apiService.post<ApiResponse<ProjectForm>>(`${this.BASE_PATH}`, data);
    return response.data.data;
  }

  /**
   * Get form by project ID
   */
  async getFormByProjectId(projectId: string): Promise<ProjectForm | null> {
    try {
      const response = await apiService.get<ApiResponse<ProjectForm>>(`${this.BASE_PATH}/project/${projectId}`);
      return response.data.data;
    } catch (error: any) {
      // Return null if form doesn't exist yet
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get form by ID
   */
  async getFormById(formId: string): Promise<ProjectForm> {
    const response = await apiService.get<ApiResponse<ProjectForm>>(`${this.BASE_PATH}/${formId}`);
    return response.data.data;
  }

  /**
   * Update form
   */
  async updateForm(formId: string, data: Partial<CreateFormDto>): Promise<ProjectForm> {
    const response = await apiService.put<ApiResponse<ProjectForm>>(`${this.BASE_PATH}/${formId}`, data);
    return response.data.data;
  }

  /**
   * Delete form
   */
  async deleteForm(formId: string): Promise<void> {
    await apiService.delete<ApiResponse<void>>(`${this.BASE_PATH}/${formId}`);
  }

  /**
   * Submit form data
   */
  async submitFormData(formId: string, data: Record<string, any>): Promise<FormSubmission> {
    const response = await apiService.post<ApiResponse<FormSubmission>>(`${this.BASE_PATH}/${formId}/submissions`, { data });
    return response.data.data;
  }

  /**
   * Get all submissions for a form
   */
  async getFormSubmissions(formId: string): Promise<FormSubmission[]> {
    const response = await apiService.get<ApiResponse<FormSubmission[]>>(`${this.BASE_PATH}/${formId}/submissions`);
    return response.data.data;
  }

  /**
   * Get submissions by project ID
   */
  async getSubmissionsByProjectId(projectId: string): Promise<FormSubmission[]> {
    const response = await apiService.get<ApiResponse<FormSubmission[]>>(`${this.BASE_PATH}/project/${projectId}/submissions`);
    return response.data.data;
  }

  /**
   * Get single submission
   */
  async getSubmission(submissionId: string): Promise<FormSubmission> {
    const response = await apiService.get<ApiResponse<FormSubmission>>(`${this.BASE_PATH}/submissions/${submissionId}`);
    return response.data.data;
  }

  /**
   * Update submission
   */
  async updateSubmission(submissionId: string, data: Record<string, any>): Promise<FormSubmission> {
    const response = await apiService.put<ApiResponse<FormSubmission>>(`${this.BASE_PATH}/submissions/${submissionId}`, { data });
    return response.data.data;
  }

  /**
   * Delete submission
   */
  async deleteSubmission(submissionId: string): Promise<void> {
    await apiService.delete<ApiResponse<void>>(`${this.BASE_PATH}/submissions/${submissionId}`);
  }
}

export const formService = new FormService();
export default formService;
