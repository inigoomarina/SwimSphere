import React from 'react';
import { useHistory } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const UserDropdownMenu = ({ onLogout }) => {
  const history = useHistory();
  
  return (
    <div className="dropdown-menu">
      <div className="dropdown-item" onClick={() => history.push('/profile')}>
        <FaUser /> Profile
      </div>
      <div className="dropdown-item" onClick={() => history.push('/settings')}>
        <FaCog /> Settings
      </div>
      <div className="dropdown-item" onClick={onLogout}>
        <FaSignOutAlt /> Logout
      </div>
    </div>
  );
};

export default UserDropdownMenu;