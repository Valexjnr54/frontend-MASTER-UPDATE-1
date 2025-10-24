import axios from 'axios';
import apiConfig from '../config/api';
import { showErrorAlert } from '@/src/utils/alerts';
import { VolunteerApplication } from '../types';

export const fetchVolunteerApplications = async (): Promise<VolunteerApplication[]> => {
    try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.GET_VOLUNTEERS}`,
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
    console.error('Error fetching Volunteer Applications:', error);
    throw error;
  }
}

export const updateApplicationStatus = async (
  volunteerApplicationId: number, 
  approved: boolean
): Promise<VolunteerApplication> => {
  try {
    const token = localStorage.getItem('authToken');
    
    // Create the request payload
    const payload = { approved };
    
    const response = await axios.put(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.UPDATE_VOLUNTEER}?volunteer_id=${volunteerApplicationId}`,
      payload,
      {
        timeout: apiConfig.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );
    
    // Check if response contains data
    if (response.data?.data) {
      return response.data.data;
    }

    if (response.data && typeof response.data === 'object') {
      return response.data;
    }

    throw new Error('Invalid API response format.');
  } catch (error) {
    console.error('Application status update error:', error);

    let message = 'Failed to update application status. Please try again.';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }

    throw new Error(message);
  }
};