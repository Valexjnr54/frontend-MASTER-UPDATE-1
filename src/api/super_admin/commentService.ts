import { showErrorAlert } from "@/src/utils/alerts";
import axios from "axios";
import apiConfig from "../../config/api";

interface Comment {
  id: number;
  content: string;
  author: string;
  email: string;
  approved: boolean;
  createdAt: string;
  blog: { title: string };
}

export const fetchComments = async (): Promise<Comment[]> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.ALL_COMMENTS}`, // ✅ should be comments
      {
        timeout: apiConfig.TIMEOUT,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching Comments:", error);
    throw error;
  }
};

export const deleteComment = async (commentId: number): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.delete(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.DELETE_COMMENT}?comment_id=${commentId}`,
      {
        timeout: apiConfig.TIMEOUT,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.data) {
      return response.data.data;
    }

    if (response.data && typeof response.data === "object") {
      return response.data;
    }

    throw new Error("Invalid API response format.");
  } catch (error) {
    console.error("Comment deletion error:", error);

    let message = "Failed to delete comment. Please try again.";
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }

    showErrorAlert("Error!", message);
    throw error;
  }
};

export const approveComment = async (commentId: number): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.put( // ✅ changed from delete to patch
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.APPROVE_COMMENT}?comment_id=${commentId}`,
      {},
      {
        timeout: apiConfig.TIMEOUT,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.data) {
      return response.data.data;
    }

    if (response.data && typeof response.data === "object") {
      return response.data;
    }

    throw new Error("Invalid API response format.");
  } catch (error) {
    console.error("Comment approval error:", error);

    let message = "Failed to approve comment. Please try again.";
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
    }

    showErrorAlert("Error!", message);
    throw error;
  }
};
