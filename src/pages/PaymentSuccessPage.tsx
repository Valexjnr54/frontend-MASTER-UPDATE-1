import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiConfig from '../config/api';

interface PaymentData {
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
  card_type: string;
  fee: number;
  merchant_amount: number;
}

interface Donation {
  id: number;
  amount: number;
  type: string;
  currency: string;
  fullName: string;
  email: string;
  reference: string;
  status: string;
  paymentUrl: string | null;
  paymentData: PaymentData | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentVerificationResponse {
  success: boolean;
  data: {
    donation: Donation;
    paymentStatus: string;
    amount: number;
    currency: string;
    fee: number;
    merchantAmount: number;
  };
}

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [donationData, setDonationData] = useState<Donation | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  const reference = searchParams.get('reference') || localStorage.getItem('donationReference');
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MISC.VERIFY_DONATION}/${reference}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Verification failed');
        }
        
        const data: PaymentVerificationResponse = await response.json();
        
        if (data.success && data.data.paymentStatus === 'success') {
          setVerificationStatus('success');
          setDonationData(data.data.donation);
          setPaymentDetails({
            fee: data.data.fee,
            merchantAmount: data.data.merchantAmount
          });
          // Clear the stored reference
          localStorage.removeItem('donationReference');
        } else {
          setVerificationStatus('failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('failed');
      }
    };
    
    if (reference) {
      verifyPayment();
    } else {
      setVerificationStatus('failed');
    }
  }, [reference]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getDonationTypeTitle = (typeId: string) => {
    const type = DONATION_TYPES.find(t => t.id === typeId);
    return type ? type.title : typeId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {verificationStatus === 'pending' && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-spinner fa-spin text-purple-600 text-2xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h1>
              <p className="text-gray-600">Please wait while we verify your payment...</p>
            </div>
          </>
        )}
        
        {verificationStatus === 'success' && donationData && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check-circle text-green-600 text-2xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">Thank you for your generous donation to our {getDonationTypeTitle(donationData.type)} program.</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="font-semibold text-gray-700 mb-4 text-lg border-b pb-2">Donation Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <p className="flex justify-between mb-3">
                      <span className="text-gray-600">Reference ID:</span>
                      <span className="font-medium text-purple-700">{donationData.reference}</span>
                    </p>
                    <p className="flex justify-between mb-3">
                      <span className="text-gray-600">Donation Type:</span>
                      <span className="font-medium">{getDonationTypeTitle(donationData.type)}</span>
                    </p>
                    <p className="flex justify-between mb-3">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">₦{donationData.amount.toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between mb-3">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600 capitalize">{donationData.status}</span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">Donor Information</h3>
                  <p className="flex justify-between mb-2">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{donationData.fullName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{donationData.email}</span>
                  </p>
                </div>
                
                {donationData.paymentData && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-2">Payment Information</h3>
                    <p className="flex justify-between mb-2">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">{donationData.paymentData.transaction_type}</span>
                    </p>
                    <p className="flex justify-between mb-2">
                      <span className="text-gray-600">Card Type:</span>
                      <span className="font-medium capitalize">{donationData.paymentData.card_type}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Processed On:</span>
                      <span className="font-medium">{formatDate(donationData.paymentData.created_at)}</span>
                    </p>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Completed On:</span>
                    <span className="font-medium">{formatDate(donationData.updatedAt)}</span>
                  </p>
                </div>
              </div>
              
              {/* <p className="text-gray-600 mb-6">
                A receipt has been sent to your email address at <span className="font-semibold">{donationData.email}</span>.
              </p> */}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Return to Home
                </Link>
                {/* <Link 
                  to="/donate"
                  className="bg-white text-purple-600 border border-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  Make Another Donation
                </Link> */}
              </div>
            </div>
          </>
        )}
        
        {verificationStatus === 'failed' && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-times-circle text-red-600 text-2xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Failed</h1>
              <p className="text-gray-600 mb-6">
                We couldn't verify your payment. This might be because the payment is still processing, 
                or there was an issue with the transaction. Please contact support if this issue persists.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/donate"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </Link>
                <Link 
                  to="/"
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Reference: {reference}<br />
                  Need help? Contact our support team at{" "}
                  <a href="mailto:support@example.com" className="text-purple-600 hover:underline">
                    support@example.com
                  </a>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Define DONATION_TYPES here or import from your constants
const DONATION_TYPES = [
  { id: 'general', icon: 'fas fa-hands-helping', title: 'General Donation', desc: 'Support our general programs and initiatives' },
  { id: 'education', icon: 'fas fa-book-open', title: 'Education Fund', desc: 'Help provide education for girls in conflict zones' },
  { id: 'livelihood', icon: 'fas fa-seedling', title: 'Livelihood Support', desc: 'Empower women with vocational training' },
  { id: 'peace', icon: 'fas fa-dove', title: 'Peace', desc: 'Fund community dialogues and mediation' },
];

export default PaymentSuccessPage;