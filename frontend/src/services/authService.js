const API_URL = process.env.REACT_APP_BACKEND_URL;

export const validateToken = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return { valid: false, role: null };
    }

    // Call a protected endpoint to validate token
    const response = await fetch(`${API_URL}/api/quotations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // Token is valid, decode to get role from response
      // For now, we consider any valid token as admin
      // In future, you can add a /api/me endpoint to get user details
      return { valid: true, role: 'admin' };
    } else if (response.status === 401 || response.status === 403) {
      // Token is invalid or expired
      localStorage.removeItem('adminToken');
      return { valid: false, role: null };
    } else {
      return { valid: false, role: null };
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, role: null };
  }
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin/login';
};
