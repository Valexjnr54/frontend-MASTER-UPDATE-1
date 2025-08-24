import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFailedPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const errorMessage = searchParams.get('message') || 'Your payment was not successful.';
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-times-circle text-red-600 text-2xl"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                    
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
                            Need help? Contact our support team at{" "}
                            <a href="mailto:support@example.com" className="text-purple-600 hover:underline">
                                support@example.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailedPage;