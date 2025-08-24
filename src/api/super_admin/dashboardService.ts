import axios from 'axios';
import apiConfig from '../../config/api';

interface DashboardStats {
    activeProjects: number,
    projectManagers:number,
    dataEntries: number,
    completionRate:any
}

export const fetchStats = async (): Promise<DashboardStats> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.DASHBOARD}`,
      {
        timeout: apiConfig.TIMEOUT,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data as DashboardStats;
  } catch (error) {
    console.error("Error fetching donation stats:", error);
    throw error;
  }
};