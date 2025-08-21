import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  console.log('AdminRoute: Component rendered');
  const { isAuthenticated, user } = useAuth();
  
  console.log('AdminRoute: useAuth returned isAuthenticated:', isAuthenticated, 'user:', user);

  // Show loading state while checking auth status
  if (isAuthenticated === null) {
    console.log('AdminRoute: Authentication status is loading, returning loading state');
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to signin
  if (!isAuthenticated) {
    console.log('AdminRoute: User not authenticated, redirecting to /signin');
    return <Navigate to="/signin" replace />;
  }

  // If authenticated but not admin, redirect to dashboard
  if (user && user.role !== 'admin') {
    console.log('AdminRoute: User authenticated but not admin, redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated admin, render children
  console.log('AdminRoute: User authenticated as admin, rendering children');
  return <>{children}</>;
};

export default AdminRoute;