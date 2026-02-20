import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Loader2 } from 'lucide-react';

const CustomerAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleSession } = useCustomerAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use useRef to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('No session_id found in URL');
          navigate('/customer/login', { replace: true });
          return;
        }

        // Process the Google session
        const result = await processGoogleSession(sessionId);

        if (result.success) {
          // Redirect to catalog/shop
          navigate('/catalog', { 
            replace: true,
            state: { user: result.user }
          });
        } else {
          console.error('Google auth failed:', result.error);
          navigate('/customer/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/customer/login', { replace: true });
      }
    };

    processAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default CustomerAuthCallback;
