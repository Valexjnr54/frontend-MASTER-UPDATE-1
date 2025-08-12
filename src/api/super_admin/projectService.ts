import axios from 'axios';
import { Project } from '../../types';
import apiConfig from '../../config/api';
import { showErrorAlert } from '@/src/utils/alerts';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface CreateProjectData {
  project_name: string;
  project_manager_id: number;
  start_date: string;
  end_date: string;
  description?: string;
  target_entry: number
}

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.ALL_PROJECT}`,
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
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const createProject = async (projectData: CreateProjectData): Promise<Project> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.CREATE_PROJECT}`, projectData,
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

export const updateProject = async (projectId: number, projectData: Partial<Project>): Promise<Project> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.UPDATE_PROJECT}?project_id=${projectId}`, projectData,
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

export const deleteProject = async (projectId: number): Promise<void> => {
  // await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.DELETE_PROJECT}?project_id=${projectId}`,
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