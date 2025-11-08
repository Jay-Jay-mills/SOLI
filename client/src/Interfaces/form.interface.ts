export type FieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'file' 
  | 'email' 
  | 'phone' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
  isDefault?: boolean;
}

export interface ProjectForm {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  fields: FormField[];
  createdBy: string;
  created: string;
  updated: string;
  isActive: boolean;
}

export interface CreateFormDto {
  projectId: string;
  name: string;
  description?: string;
  fields: Omit<FormField, 'id'>[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  projectId: string;
  data: Record<string, any>;
  submittedBy: string;
  submitted: string;
  files?: {
    fieldId: string;
    fileName: string;
    fileUrl: string;
  }[];
}
