import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect authenticated users to their authenticated dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Redirect unauthenticated users to home
  return <Navigate to="/" replace />;
};

export default DashboardPage;