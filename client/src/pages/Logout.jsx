import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { logoutUser } from '../utils/api';
import Loader from '../components/common/Loader';

const Logout = () => {
  const history = useHistory();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout API
        await logoutUser();
        
        // Clear token from localStorage
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        // Force a complete page reload to reset all application state
        window.location.href = '/login';
      } catch (error) {
        console.error('Error during logout:', error);
        
        // Clear token as a fallback
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        // Force reload to login page
        window.location.href = '/login';
      }
    };
    
    performLogout();
  }, [history]);
  
  return (
    <div className="logout-page">
      <Loader />
      <p className="text-center mt-4">Logging you out...</p>
    </div>
  );
};

export default Logout;
