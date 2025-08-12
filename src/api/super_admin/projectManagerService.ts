import axios from 'axios';
import apiConfig from '../../config/api';
import { ProjectManager } from '../../types';
import { showErrorAlert } from '@/src/utils/alerts';

export type CreateProjectManagerData = {
  fullname: string;
  email: string;
  phone_number: string;
  username: string;
};

export const createProjectManager = async (managerData: CreateProjectManagerData): Promise<ProjectManager> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.CREATE_PROJECT_MANAGER}`,
      managerData,
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

export const fetchProjectManagers = async (): Promise<ProjectManager[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.ALL_PROJECT_MANAGER}`,
      {
        timeout: apiConfig.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );

    return response.data.data
  } catch (error) {
    console.error('Error fetching project managers:', error);
    throw error;
  }
};

export const getProjectManagerDetails = async (id: string) => {
  // const response = await apiClient.get(`/super-admin/project-managers/${id}`);
  // return response.data;
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.PROJECT_MANAGER}?user_id=${id}`,
      {
        timeout: apiConfig.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );

    return response.data.data
  } catch (error) {
    console.error('Error fetching project managers:', error);
    throw error;
  }
};

export const updateProjectManager = async (id: string, data: Partial<ProjectManager>) => {
  // const response = await apiClient.patch(`/super-admin/project-managers/${id}`, data);
  // return response.data;
  // try {
  //   const token = localStorage.getItem('authToken');
  //   const response = await axios.put(
  //     `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.CREATE_PROJECT_MANAGER}`,
  //     data,
  //     {
  //       timeout: apiConfig.TIMEOUT,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //     }
  //   );
    
  //   if (response.data?.data) {
  //     return response.data.data;
  //   }

  //   if (response.data && typeof response.data === 'object') {
  //     return response.data;
  //   }

  //   throw new Error('Invalid API response format.');
  // } catch (error) {
  //   console.error('Project creation error:', error);
    
  //       let message = 'Failed to create project. Please try again.';
  //       if (axios.isAxiosError(error)) {
  //         message = error.response?.data?.message || message;
  //       }
    
  //       throw error;
  // }
};

export const deleteProjectManager = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.DELETE_PROJECT_MANAGER}?user_id=${id}`,
      {
        timeout: apiConfig.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );
    
    // For delete operations, we typically don't need to return data
    if (response.status >= 200 && response.status < 300) {
      return; // Success case
    }
    
    throw new Error(response.data?.message || 'Failed to delete project manager');
  } catch (error) {
    console.error('Delete project manager error:', error);
    let message = 'Failed to delete project manager. Please try again.';
    
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }
    
    throw new Error(message);
  }
};
