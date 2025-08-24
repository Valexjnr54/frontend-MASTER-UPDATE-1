import axios from 'axios';
import { Category } from '../../types';
import apiConfig from '../../config/api';
import { showErrorAlert } from '@/src/utils/alerts';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface CreateCategoryData {
  name: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.ALL_CATEGORIES}`,
        {
            timeout: apiConfig.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Categorys:', error);
    throw error;
  }
};

export const createCategory = async (categoryData: CreateCategoryData): Promise<Category> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.CREATE_CATEGORY}`, categoryData,
        {
            timeout: apiConfig.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        }
    );
    if (response.data?.data) {
      return response.data.data;
    }

    if (response.data && typeof response.data === 'object') {
      return response.data;
    }

    throw new Error('Invalid API response format.');
  } catch (error) {
    console.error('Project creation error:', error);

    let message = 'Failed to create project. Please try again.';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }
    
    throw error;
  }
};

export const updateCategory = async (CategoryId: number, CategoryData: Partial<Category>): Promise<Category> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.UPDATE_CATEGORY}?category_id=${CategoryId}`, CategoryData,
        {
            timeout: apiConfig.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        }
    );
    if (response.data?.data) {
      return response.data.data;
    }

    if (response.data && typeof response.data === 'object') {
      return response.data;
    }

    throw new Error('Invalid API response format.');
  } catch (error) {
    console.error('Category creation error:', error);

    let message = 'Failed to create Category. Please try again.';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }

    throw error;
  }
};

export const deleteCategory = async (CategoryId: number): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.DELETE_CATEGORY}?category_id=${CategoryId}`,
        {
            timeout: apiConfig.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        }
    );
    if (response.data?.data) {
      return response.data.data;
    }

    if (response.data && typeof response.data === 'object') {
      return response.data;
    }

    throw new Error('Invalid API response format.');
  } catch (error) {
    console.error('Category creation error:', error);

    let message = 'Failed to create Category. Please try again.';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }

    throw error;
  }
};