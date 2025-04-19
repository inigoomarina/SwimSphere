import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { logoutUser } from '../utils/api';
import Loader from '../components/common/Loader';

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const history = useHistory();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout API
        logoutUser();
        
        // Perform local logout
        if (logout) {
          await logout();
        } else {
          // Fallback if logout function not available in context
          localStorage.removeItem('token');
        }
        
        // Redirect to login page
        history.push('/login');
      } catch (error) {
        console.error('Error during logout:', error);
        history.push('/login');
      }
    };
    
    performLogout();
  }, [logout, history]);
  
  return (
    <div className="logout-page">
      <Loader />
      <p className="text-center mt-4">Logging you out...</p>
    </div>
  );
};

export default Logout;
