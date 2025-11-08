export interface Customer {
  _id: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  isActive: boolean;
  isDeleted: boolean;
  created: string;
  createdBy: string;
  updated?: string;
  updatedBy?: string;
}

export interface CreateCustomerDto {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  isActive?: boolean;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface GetCustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}
