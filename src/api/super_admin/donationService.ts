import axios from 'axios';
import apiConfig from '../../config/api';
import { showErrorAlert } from '@/src/utils/alerts';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface Donation {
  id: number;
  amount: number;
  type: string;
  currency: string;
  fullName: string;
  email: string;
  reference: string;
  status: string;
  paymentUrl: string;
  paymentData: {
    transaction_amount: number;
    transaction_ref: string;
    email: string;
    transaction_status: string;
    transaction_currency_id: string;
    created_at: string;
    transaction_type: string;
    merchant_name: string;
    merchant_business_name: string;
    gateway_transaction_ref: string;
    merchant_email: string;
    meta: {
      donationId: number;
      donationType: string;
    };
    card_type?: string;
    fee: number;
    merchant_amount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface DonationStats {
  total_donations: number;
  total_amount: number;
  total_donors: number;
  funded_project: number;
  donations_by_type: Record<string, { count: number; total_amount: number }>;
}


export const fetchDonations = async (): Promise<Donation[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.ALL_DONATION}`,
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
    console.error('Error fetching Donations:', error);
    throw error;
  }
};

export const fetchDonationStats = async (): Promise<DonationStats> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(
      `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.DONATION_STATS}`,
      {
        timeout: apiConfig.TIMEOUT,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data as DonationStats;
  } catch (error) {
    console.error("Error fetching donation stats:", error);
    throw error;
  }
};