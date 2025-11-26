import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import InactivityWarning from './InactivityWarning';
import { validateToken } from '../services/authService';

const ProtectedRoute = ({ children, requireAdmin = true }) => {
  const [authState, setAuthState] = useState({ 
    checking: true, 
    authenticated: false, 
    role: null 
  });
  
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[ProtectedRoute] Starting authentication check...');
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.log('[ProtectedRoute] No token found - redirecting to login');
        setAuthState({ checking: false, authenticated: false, role: null });
        return;
      }

      console.log('[ProtectedRoute] Token found, validating with backend...');
      // Validate token with backend
      const { valid, role, user } = await validateToken();
      
      console.log('[ProtectedRoute] Validation result:', { valid, role });
      
      if (!valid) {
        console.error('[ProtectedRoute] Token validation failed - redirecting to login');
        localStorage.removeItem('adminToken');
        setAuthState({ checking: false, authenticated: false, role: null });
      } else {
        console.log('[ProtectedRoute] Authentication successful');
        setAuthState({ checking: false, authenticated: true, role });
      }
    };

    checkAuth();
  }, []);
  
  const { showWarning, remainingTime, handleStayLoggedIn, logout } = useInactivityTimer();
  
  // Show loading state while checking authentication
  if (authState.checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated - redirect to login
  if (!authState.authenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check if admin access is required
  if (requireAdmin && authState.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Admin privileges required.
          </p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
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
