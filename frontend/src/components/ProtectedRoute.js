import React from 'react';
import { Navigate } from 'react-router-dom';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import InactivityWarning from './InactivityWarning';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const { showWarning, remainingTime, handleStayLoggedIn, logout } = useInactivityTimer();
  
  if (!token) {
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
