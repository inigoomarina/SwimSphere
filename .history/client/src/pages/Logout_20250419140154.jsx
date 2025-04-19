import React, { useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Logout = () => {
  const { logout } = useContext(AuthContext);
  
  useEffect(() => {
    // Execute the logout function when component mounts
    logout();
  }, [logout]);
  
  // Immediately redirect to login page
  return <Redirect to="/login" />;
};

export default Logout;
