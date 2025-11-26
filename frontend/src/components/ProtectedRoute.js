import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import InactivityWarning from './InactivityWarning';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  
  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
  }, []);
  
  const { showWarning, remainingTime, handleStayLoggedIn, logout } = useInactivityTimer();
  
  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-orange-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login if no token
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <>
      {children}
      {showWarning && (
        <InactivityWarning
          remainingTime={remainingTime}
          onStayLoggedIn={handleStayLoggedIn}
          onLogout={logout}
        />
      )}
    </>
  );
};

export default ProtectedRoute;
