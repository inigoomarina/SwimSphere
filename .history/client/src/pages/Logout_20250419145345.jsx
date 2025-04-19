import React, { useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { logoutUser } from '../utils/api';

const Logout = () => {
  const { logout } = useContext(AuthContext);
  
  useEffect(() => {
    // Call logout function
    logoutUser();
    logout();
  }, [logout]);

  return <Redirect to="/login" />;
};

export default Logout;
