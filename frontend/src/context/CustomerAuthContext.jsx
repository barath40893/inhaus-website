import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerAuthContext = createContext();

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('customer_session_token');
    if (token) {
      setSessionToken(token);
      checkAuth(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async (token) => {
    try {
      const response = await fetch(`${backendUrl}/api/customer/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      } else {
        // Invalid session
        localStorage.removeItem('customer_session_token');
        setSessionToken(null);
        setCustomer(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('customer_session_token');
      setSessionToken(null);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${backendUrl}/api/customer/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('customer_session_token', data.session_token);
        setSessionToken(data.session_token);
        setCustomer({
          user_id: data.user_id,
          email: data.email,
          name: data.name,
          picture: data.picture
        });
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await fetch(`${backendUrl}/api/customer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, phone })
      });

      if (response.ok) {
        // Auto-login after registration
        return await login(email, password);
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const processGoogleSession = async (sessionId) => {
    try {
      const response = await fetch(`${backendUrl}/api/customer/google-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('customer_session_token', data.session_token);
        setSessionToken(data.session_token);
        setCustomer({
          user_id: data.user_id,
          email: data.email,
          name: data.name,
          picture: data.picture
        });
        return { success: true, user: data };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Google login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${backendUrl}/api/customer/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('customer_session_token');
      setSessionToken(null);
      setCustomer(null);
    }
  };

  const value = {
    customer,
    loading,
    sessionToken,
    isAuthenticated: !!customer,
    login,
    register,
    processGoogleSession,
    logout
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};
