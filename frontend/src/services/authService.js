// Smart API URL detection - works in both preview and production
const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  // If running on inhaus.co.in (production), use same domain
  if (hostname === 'inhaus.co.in' || hostname === 'www.inhaus.co.in') {
    return 'https://inhaus.co.in';
  }
  
  // If running on preview URL, use preview backend
  if (hostname.includes('inhaus-quote.preview.emergentagent.com')) {
    return 'https://inhaus-quote.preview.emergentagent.com';
  }
  
  // For localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8001';
  }
  
  // Fallback to environment variable or relative path
  return process.env.REACT_APP_BACKEND_URL || '';
};

const API_URL = getApiUrl();

export const validateToken = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.log('[Auth] No token found');
      return { valid: false, role: null, user: null };
    }

    console.log('[Auth] Validating token with backend...');
    console.log('[Auth] API URL:', API_URL);

    // Call /api/auth/me to validate token and get user info
    const url = `${API_URL}/api/auth/me`;
    console.log('[Auth] Calling:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    console.log('[Auth] Response status:', response.status);

    if (response.ok) {
      const user = await response.json();
      console.log('[Auth] Token valid, user:', user.email, 'role:', user.role);
      return { 
        valid: true, 
        role: user.role, 
        user: user 
      };
    } else if (response.status === 401 || response.status === 403) {
      // Token is invalid or expired
      console.error('[Auth] Token invalid or expired');
      localStorage.removeItem('adminToken');
      return { valid: false, role: null, user: null };
    } else {
      console.error('[Auth] Unexpected response:', response.status);
      return { valid: false, role: null, user: null };
    }
  } catch (error) {
    console.error('[Auth] Token validation error:', error);
    // If network error, don't allow access
    localStorage.removeItem('adminToken');
    return { valid: false, role: null, user: null };
  }
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin/login';
};
