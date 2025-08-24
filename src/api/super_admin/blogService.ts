import axios from 'axios';
import { Blog } from '../../types';
import apiConfig from '../../config/api';
import { showErrorAlert } from '@/src/utils/alerts';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface CreateBlogData {
  title: string;
  content: string;
  published: boolean;
  category_id: string;
  tag_id: string;
  cover_image?: File;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  published?: boolean;
  category_id?: string;
  tag_id?: string;
  cover_image?: File;
}

export const fetchBlogs = async (): Promise<Blog[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.ALL_BLOGS}`,
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
    console.error('Error fetching Blogs:', error);
    throw error;
  }
};

export const createBlog = async (formData: FormData): Promise<Blog> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.CREATE_BLOG}`, formData,
        {
            timeout: apiConfig.TIMEOUT,
            headers: {
                'Content-Type': 'multipart/form-data',
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
    console.error('Blog creation error:', error);

    let message = 'Failed to create blog. Please try again.';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }
    
    showErrorAlert('Error!', message);
    throw error;
  }
};

export const updateBlog = async (blogId: number, formData: FormData): Promise<Blog> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.UPDATE_BLOG}?blog_id=${blogId}`, formData,
        {
            timeout: apiConfig.TIMEOUT,
            headers: {
                'Content-Type': 'multipart/form-data',
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
    console.error('Blog update error:', error);

    let message = 'Failed to update blog. Please try again.';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }

    showErrorAlert('Error!', message);
    throw error;
  }
};

export const deleteBlog = async (blogId: number): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.DELETE_BLOG}?blog_id=${blogId}`,
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
    console.error('Blog deletion error:', error);

    let message = 'Failed to delete blog. Please try again.';
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }

    showErrorAlert('Error!', message);
    throw error;
  }
};

// Helper function to create FormData from blog data
export const createBlogFormData = (data: any): FormData => {
  const formData = new FormData();
  
  // Append all text fields
  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('category_id', data.category_id);
  formData.append('tag_id', data.tag_id);
  formData.append('published', data.published.toString());
  
  // Append the image file if it exists
  if (data.cover_image && data.cover_image instanceof File) {
    formData.append('cover_image', data.cover_image);
  }
  
  return formData;
};