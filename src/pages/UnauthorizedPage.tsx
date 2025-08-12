// src/pages/UnauthorizedPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="text-gray-700 mb-6">
          You don't have permission to access this page with your current role.
        </p>
        <div className="flex flex-col space-y-3">
          <Link 
            to="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Home Page
          </Link>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Logout and Sign In as Different User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;