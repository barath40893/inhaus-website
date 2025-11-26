const API_URL = process.env.REACT_APP_BACKEND_URL;

export const validateToken = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return { valid: false, role: null, user: null };
    }

    // Call /api/auth/me to validate token and get user info
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const user = await response.json();
      return { 
        valid: true, 
        role: user.role, 
        user: user 
      };
    } else if (response.status === 401 || response.status === 403) {
      // Token is invalid or expired
      localStorage.removeItem('adminToken');
      return { valid: false, role: null, user: null };
    } else {
      return { valid: false, role: null, user: null };
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, role: null, user: null };
  }
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin/login';
};
