import React from 'react'; // Add this import
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  children?: React.ReactElement;
  requiredRole: 'admin' | 'manager';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredRole, 
  children 
}) => {
  const authToken = localStorage.getItem('authToken');
  const userDataString = localStorage.getItem('userData');
  
  try {
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userRole = userData?.role?.toLowerCase() || '';

    if (!authToken) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole === 'admin' && !userRole.includes('super_admin')) {
      return <Navigate to="/unauthorized" replace />;
    }

    if (requiredRole === 'manager' && !userRole.includes('manager')) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children ? children : <Outlet />;

  } catch (error) {
    console.error('Error verifying auth:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;