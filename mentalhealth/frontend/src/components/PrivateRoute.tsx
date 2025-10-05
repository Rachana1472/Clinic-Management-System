import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactElement;
  roles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const user = JSON.parse(userString);
  const userRole = user?.userType;

  if (!userRole || !roles.includes(userRole)) {
    // Redirect to a relevant page if role does not match
    // For example, a user trying to access an admin page could be sent to their dashboard
    switch (userRole) {
      case 'user':
        return <Navigate to="/user" replace />;
      case 'therapist':
        return <Navigate to="/therapist" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 