// API configuration constants
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.legasi.org/api/v1';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:7000/api/v1';

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      ADMIN_LOGIN: '/auth/admin-login',

      PROJECT_MANAGER_LOGIN: '/auth/project-manager/login',
      PROJECT_MANAGER_EMAIL_VERIFICATION: '/auth/project-manager/email-verification',
      PROJECT_MANAGER_CHANGE_TEMP_PASSWORD: '/auth/project-manager/change-temp-password',
      PROJECT_MANAGER_PROFILE: '/auth/project-manager/profile',
      PROFILE_MANAGER_UPDATE_PROFILE:'/auth/project-manager/update-profile',
      PROFILE_MANAGER_CHANGE_PASSWORD: '/auth/project-manager/change-password'
    },
    ADMIN:{
        CREATE_PROJECT_MANAGER: '/admin/create-project-manager',
        ALL_PROJECT_MANAGER: '/admin/project-managers',
        PROJECT_MANAGER: '/admin/project-manager',
        DELETE_PROJECT_MANAGER: '/admin/delete-project-manager',

        CREATE_PROJECT: '/admin/create-project',
        ALL_PROJECT: '/admin/projects',
        PROJECT: '/admin/project',
        UPDATE_PROJECT: '/admin/update-project',
        DELETE_PROJECT: '/admin/delete-project',

        ALL_DATA_ENTRIES: '/admin/datas',
        DATA_ENTRY: '/admin/data',
        DELETE_DATA_ENTRY: '/admin/delete-data',

        DASHBOARD: '/admin/dashboard'
    },
    PROJECT_MANAGER: {
      ALL_PROJECT: '/project-manager/projects',
      PROJECT: '/project-manager/project',

      UPLOAD_IMAGE: '/project-manager/upload-image',
      UPLOAD_VIDEO: '/project-manager/upload-video',
      UPLOAD_FILE: '/project-manager/upload-document',

      CREATE_DATA_ENTRY: '/project-manager/create-data',
      UPDATE_DATA_ENTRY: '/project-manager/update-data',
      DATA_ENTRIES: '/project-manager/datas',
      DATA_ENTRY: '/project-manager/data',
      DELETE_DATA_ENTRY: '/project-manager/delete-data',

      DASHBOARD: '/project-manager/dashboard'
    }
  },
  DEFAULT_ERROR_MESSAGE: 'An unexpected error occurred. Please try again.',
  TIMEOUT: 60000, // 60 seconds
};