import axios from 'axios';
import { Project, SubmittedData } from '../../types';
import apiConfig from '../../config/api';

const API_BASE_URL = apiConfig.BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchProjectCount = async (): Promise<number> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get<ApiResponse<{ 
      project_count: number;
      data_entry_count: number;
    }>>(
      `${API_BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.DASHBOARD}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: apiConfig.TIMEOUT
      }
    );
    return response.data.data.project_count;
  } catch (error) {
    console.error('Error fetching project count:', error);
    throw error;
  }
};

export const fetchDataEntryCount = async (): Promise<number> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get<ApiResponse<{ 
      project_count: number;
      data_entry_count: number;
    }>>(
      `${API_BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.DASHBOARD}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: apiConfig.TIMEOUT
      }
    );
    return response.data.data.data_entry_count;
  } catch (error) {
    console.error('Error fetching data entry count:', error);
    throw error;
  }
};

export const fetchRecentDataEntry = async (): Promise<SubmittedData[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get<{
      message: string;
      data: {
        recent_data_entry: SubmittedData[];
        project_count: number;
        data_entry_count: number;
      };
    }>(`${API_BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.DASHBOARD}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: apiConfig.TIMEOUT
    });
    
    return response.data.data.recent_data_entry || [];
  } catch (error) {
    console.error('Error fetching recent entries:', error);
    return [];
  }
};