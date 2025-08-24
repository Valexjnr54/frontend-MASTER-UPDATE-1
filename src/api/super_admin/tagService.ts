import axios from 'axios';
import { Tag } from '../../types';
import apiConfig from '../../config/api';
import { showErrorAlert } from '@/src/utils/alerts';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface CreateTagData {
  name: string;
}

export const fetchTags = async (): Promise<Tag[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.ALL_TAGS}`,
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
    console.error('Error fetching Tags:', error);
    throw error;
  }
};

export const createTag = async (tagData: CreateTagData): Promise<Tag> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.CREATE_TAG}`, tagData,
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

export const updateTag = async (TagId: number, TagData: Partial<Tag>): Promise<Tag> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.UPDATE_TAG}?tag_id=${TagId}`, TagData,
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
    console.error('Tag creation error:', error);

    let message = 'Failed to create Tag. Please try again.';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }

    throw error;
  }
};

export const deleteTag = async (TagId: number): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.DELETE_TAG}?tag_id=${TagId}`,
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
    console.error('Tag creation error:', error);

    let message = 'Failed to create Tag. Please try again.';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }

    throw error;
  }
};