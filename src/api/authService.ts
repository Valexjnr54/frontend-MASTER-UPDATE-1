import axios from 'axios';
import apiConfig from '../config/api';

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    role: string;
    name: string;
    email: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async adminLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.AUTH.ADMIN_LOGIN}`,
        credentials,
        {
          timeout: apiConfig.TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleAuthError(error);
    }
  },

  async projectManagerLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const payload = {
        login_id: credentials.email,
        password: credentials.password
      }
      
      const response = await axios.post(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.AUTH.PROJECT_MANAGER_LOGIN}`,
        payload,
        {
          timeout: apiConfig.TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleAuthError(error);
    }
  },

  // Verify email with PIN
  async verifyEmail(data: { email: string; pin: string }) {
    const payload = {
      verificationCode: data.pin
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.AUTH.PROJECT_MANAGER_EMAIL_VERIFICATION}`, payload,
        {
          timeout: apiConfig.TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );
      // if (response.data?.data) {
      //   return response.data.data;
      // }
  
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
  },

  // Change temporary password
  async changeTemporaryPassword(data: { email: string; current_password:string; new_password: string }) {
    try {
      const payload = {
        newPassword: data.new_password,
        confirmPassword: data.new_password,
      }
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.AUTH.PROJECT_MANAGER_CHANGE_TEMP_PASSWORD}`, payload,
        {
          timeout: apiConfig.TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );
      
      // if (response.data?.data) {
      //   return response.data.data;
      // }

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
  },

  // Resend verification PIN
  async resendVerificationPin(email: string) {
    try {
      await axios.post('/api/auth/resend-verification-pin', { email });
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to resend PIN'
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred'
      };
    }
  },

  handleAuthError(error: any): LoginResponse {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with a status other than 2xx
        return {
          success: false,
          message: error.response.data.message || apiConfig.DEFAULT_ERROR_MESSAGE,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection.',
        };
      }
    }
    // Unknown error
    return {
      success: false,
      message: apiConfig.DEFAULT_ERROR_MESSAGE,
    };
  },

  storeAuthData(token: string, userData: any): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  },

  clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  getAuthData(): { token: string | null; user: any | null } {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return {
      token,
      user: user ? JSON.parse(user) : null
    };
  },
};