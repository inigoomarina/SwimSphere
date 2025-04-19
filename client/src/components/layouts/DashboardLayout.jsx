import React from 'react';
import { motion } from 'framer-motion';
import './DashboardLayout.css';

const DashboardLayout = ({ leftSidebar, mainContent, rightSidebar }) => {
  return (
    <div className="dashboard-layout-container mt-16">
      <div className="dashboard-layout">
        {/* Left Sidebar */}
        <motion.div 
          className="dashboard-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {leftSidebar}
        </motion.div>
        
        {/* Main Content */}
        <motion.div 
          className="dashboard-main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {mainContent}
        </motion.div>
        
        {/* Right Sidebar */}
        <motion.div 
          className="dashboard-aside"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {rightSidebar}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardLayout;
