
import api from '../api';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async createCategory(name: string, description?: string): Promise<Category> {
    const response = await api.post('/categories', { name, description });
    return response.data;
  },

  async updateCategory(id: string, name: string, description?: string): Promise<Category> {
    const response = await api.put(`/categories/${id}`, { name, description });
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
