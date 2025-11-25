import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';

const InactivityWarning = ({ remainingTime, onStayLoggedIn, onLogout }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-orange-100 rounded-full mr-4">
            <AlertCircle className="text-orange-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Session Timeout Warning</h2>
            <p className="text-sm text-gray-600">Your session is about to expire</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <Clock className="text-orange-600 mr-2" size={24} />
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">You will be logged out in</p>
              <p className="text-4xl font-bold text-orange-600">{remainingTime}</p>
              <p className="text-sm text-gray-600 mt-1">seconds</p>
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-center mb-6">
          You've been inactive for 4 minutes. For your security, you'll be automatically logged out due to inactivity.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={onStayLoggedIn}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            Stay Logged In
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Logout Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarning;
