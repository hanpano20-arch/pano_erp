import axios from 'axios';

export interface Product {
  id: string;
  code: string;
  name: string;
  brand_id?: string | null;
  list_price: string | number;
  currency: string;
  is_active: boolean;
  tenant_id: string;
}

export interface ProductCreate {
  code: string;
  name: string;
  list_price: number;
  currency: string;
  is_active: boolean;
}

export interface ProductUpdate {
  code?: string;
  name?: string;
  list_price?: number;
  currency?: string;
  is_active?: boolean;
}

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Customer {
  id: string;
  code: string;
  company_name: string;
  is_active: boolean;
  tenant_id: string;
}

export interface CustomerCreate {
  code: string;
  company_name: string;
  is_active: boolean;
}

export interface QuotationItem {
  id: string;
  tenant_id: string;
  quotation_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  currency: string;
}

export interface QuotationItemCreate {
  product_id: string;
  quantity: number;
  unit_price: number;
  currency: string;
}

export interface Quotation {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  project_id?: string | null;
  customer_id: string;
  total_amount: number;
  currency: string;
  labor_cost: number;
  margin_percentage: number;
  status: string;
  created_at: string;
  updated_at: string;
  items: QuotationItem[];
}

export interface QuotationCreate {
  code: string;
  name: string;
  project_id?: string | null;
  customer_id: string;
  total_amount: number;
  currency: string;
  labor_cost: number;
  margin_percentage: number;
  status: string;
  items: QuotationItemCreate[];
}

export const productApi = {
  list: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/');
    return response.data;
  },

  create: async (product: ProductCreate): Promise<Product> => {
    const response = await apiClient.post<Product>('/products/', product);
    return response.data;
  },

  update: async (id: string, product: ProductUpdate): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

export const customerApi = {
  list: async (): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>('/customers/');
    return response.data;
  },
  create: async (customer: CustomerCreate): Promise<Customer> => {
    const response = await apiClient.post<Customer>('/customers/', customer);
    return response.data;
  },
};

export const quotationApi = {
  list: async (): Promise<Quotation[]> => {
    const response = await apiClient.get<Quotation[]>('/quotations/');
    return response.data;
  },
  create: async (quotation: QuotationCreate): Promise<Quotation> => {
    const response = await apiClient.post<Quotation>('/quotations/', quotation);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/quotations/${id}`);
  },
};

