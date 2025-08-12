import axios from 'axios';
import { Project } from '../../types';
import apiConfig from '../../config/api';

const API_BASE_URL = apiConfig.BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchMyProjects = async (): Promise<Project[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get<ApiResponse<Project[]>>(
      `${API_BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.ALL_PROJECT}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: apiConfig.TIMEOUT
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const fetchProject = async (projectId: number) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get<ApiResponse<Project[]>>(
      `${API_BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.PROJECT}?project_id=${projectId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: apiConfig.TIMEOUT
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};