import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Corrected: Use default import
import './index.css'; // Assuming you have a global CSS file
// ... other imports like reportWebVitals, contexts, etc.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap App with any context providers if necessary */}
    <App />
  </React.StrictMode>
);

