import React from 'react';

const ActionButton = ({ icon, children, onClick, className, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`action-button flex items-center gap-2 ${className || ''}`}
      {...props}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default ActionButton;
