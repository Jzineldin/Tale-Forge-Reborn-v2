import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.log('ProtectedRoute: Component rendered');
  const { isAuthenticated, user } = useAuth();
  
  console.log('ProtectedRoute: useAuth returned isAuthenticated:', isAuthenticated, 'user:', user);

  // Show loading state while checking auth status
  if (isAuthenticated === null) {
    console.log('ProtectedRoute: Authentication status is loading, returning loading state');
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to signin
  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to /signin');
    return <Navigate to="/signin" replace />;
  }

  // If authenticated, render children
  console.log('ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;