import { useEffect, useState } from 'react';
import { authorize, logout, isAuthenticated } from '../../utils/auth/basecampAuth';

export default function Popup() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication status when popup opens
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);
    } catch (err) {
      console.error('Error checking auth status:', err);
      setError('Failed to check authentication status');
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await authorize();
      setIsLoggedIn(true);
    } catch (err) {
      console.error('Login error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await logout();
      setIsLoggedIn(false);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <h1 className="text-xl font-bold mb-4">Basecamp AI Assistant</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4">
            {error}
          </div>
        )}
        
        {isLoggedIn ? (
          <div className="flex flex-col items-center">
            <p className="mb-4">You are logged in to Basecamp</p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="mb-4">Connect to your Basecamp account</p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Login with Basecamp'}
            </button>
          </div>
        )}
      </header>
    </div>
  );
}
