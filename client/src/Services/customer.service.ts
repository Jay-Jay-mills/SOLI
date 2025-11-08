import { apiService } from './api.service';
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  GetCustomersParams,
  GetCustomersResponse,
} from '@/Interfaces';

class CustomerService {
  private readonly basePath = '/customers';

  async getCustomers(params?: GetCustomersParams): Promise<GetCustomersResponse> {
    const response = await apiService.get<GetCustomersResponse>(this.basePath, { params });
    return response.data;
  }

  async getCustomerById(id: string): Promise<Customer> {
    const response = await apiService.get<Customer>(`${this.basePath}/${id}`);
    return response.data;
  }

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await apiService.post<Customer>(this.basePath, data);
    return response.data;
  }

  async updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const response = await apiService.put<Customer>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await apiService.delete(`${this.basePath}/${id}`);
  }

  async getActiveCustomers(): Promise<Customer[]> {
    const response = await apiService.get<Customer[]>(`${this.basePath}/active`);
    return response.data;
  }
}

export const customerService = new CustomerService();
