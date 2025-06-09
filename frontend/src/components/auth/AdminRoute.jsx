import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Debug logging
  console.log('AdminRoute - Auth Status:', { isAuthenticated, user, role: user?.role });

  if (!isAuthenticated) {
    console.log('AdminRoute - Redirecting to login: Not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    console.log('AdminRoute - Redirecting to home: Not admin role, current role:', user?.role);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
