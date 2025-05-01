import React, { createContext, useState, useContext, useCallback } from 'react';

// Create context with default values
export const ToastContext = createContext({
  showToast: () => {},
  hideToast: () => {},
  toasts: []
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    console.warn("useToast must be used within a ToastProvider");
    // Return a default implementation to prevent crashes
    return {
      showToast: () => {},
      hideToast: () => {},
      toasts: []
    };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const hideToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      hideToast(id);
    }, duration);
    
    return id;
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toasts }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <p>{toast.message}</p>
            <button onClick={() => hideToast(toast.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
