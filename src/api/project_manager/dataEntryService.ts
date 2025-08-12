// src/services/dataEntryService.ts
import apiConfig from '@/src/config/api';
import { showErrorAlert } from '@/src/utils/alerts';
import axios from 'axios';

interface Project {
  id: string;
  name: string;
}

interface DataEntry {
  id: string;
  project_id: string;
  project_name: string;
  date: string;
  description: string;
  location: string;
  image_url: string;
  video_url: string;
  document_url: string;
  metadata: CustomField[];
  project_manager?: {
    fullname: string;
    username: string;
  };
}

interface CustomField {
  name: string;
  value: string;
}

interface MediaFile {
  file: File;
  type: 'image' | 'video' | 'file';
  previewUrl?: string;
  uploading: boolean;
  error?: string;
  cloudinaryUrl?: string;
}

interface SubmittedData {
  project_id: number;
  project: string;
  date: string;
  description: string;
  location: string;
  image_url: string;
  video_url: string;
  document_url: string;
  metadata: CustomField[];
}

const getAuthToken = () => localStorage.getItem('authToken');

// Project-related services
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.ALL_PROJECT}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const result = await response.json();
    const projectsData = result.data;
    
    if (!Array.isArray(projectsData)) {
      throw new Error('Expected array in data property');
    }

    return projectsData.map(project => ({
      id: project.id.toString(),
      name: project.project_name
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    showErrorAlert('Error', 'Failed to load projects');
    throw error;
  }
};

// Data Entry services
export const fetchDataEntries = async (): Promise<DataEntry[]> => {
  try {
    const token = getAuthToken();
    // const response = await fetch(
    //   `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.DATA_ENTRIES}`,
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}`
    //     }
    //   }
    // );

    // if (!response.ok) {
    //   throw new Error('Failed to fetch data entries');
    // }

    // const result = await response.json();
    // return result.data || [];

    const response = await axios.get(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.DATA_ENTRIES}`,{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.data.map((entry: any) => ({
      ...entry,
      // Ensure project structure exists
      project: entry.project || { project_name: 'Unknown Project' }
    }));
  } catch (error) {
    console.error('Error fetching data entries:', error);
    showErrorAlert('Error', 'Failed to load entries');
    throw error;
  }
};

export const createDataEntry = async (data: SubmittedData): Promise<DataEntry> => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.CREATE_DATA_ENTRY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error('Submission failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating data entry:', error);
    throw error;
  }
};

export const updateDataEntry = async (id: string, data: Partial<DataEntry>): Promise<DataEntry> => {
  try {
    const token = getAuthToken();
    const response = await axios.put<{ data: DataEntry }>(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.UPDATE_DATA_ENTRY}?data_entry_id=${id}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating data entry:', error);
    throw error;
  }
};

export const deleteDataEntry = async (id: string): Promise<void> => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.DELETE_DATA_ENTRY}?data_entry_id=${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Deletion failed');
    }
  } catch (error) {
    console.error('Error deleting data entry:', error);
    throw error;
  }
};

// Media upload services
export const uploadImage = async (file: File): Promise<string> => {
  return uploadMedia(file, 'image');
};

export const uploadVideo = async (file: File): Promise<string> => {
  return uploadMedia(file, 'video');
};

export const uploadDocument = async (file: File): Promise<string> => {
  return uploadMedia(file, 'file');
};

const uploadMedia = async (file: File, type: 'image' | 'video' | 'file'): Promise<string> => {
  const formData = new FormData();
  formData.append(type === 'file' ? 'document' : type, file);
  
  let endpoint;
  switch(type) {
    case 'image':
      endpoint = `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.UPLOAD_IMAGE}`;
      break;
    case 'video':
      endpoint = `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.UPLOAD_VIDEO}`;
      break;
    case 'file':
      endpoint = `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.PROJECT_MANAGER.UPLOAD_FILE}`;
      break;
    default:
      throw new Error(`Unknown file type: ${type}`);
  }
  
  try {
    const token = getAuthToken();
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    switch(type) {
      case 'image':
        if (!data.image_url) throw new Error('Missing image_url in response');
        return data.image_url;
      case 'video':
        if (!data.video_url) throw new Error('Missing video_url in response');
        return data.video_url;
      case 'file':
        if (!data.document_url) throw new Error('Missing document_url in response');
        return data.document_url;
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  } catch (error) {
    console.error(`Error uploading ${type}:`, error);
    throw error;
  }
};