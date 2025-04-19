import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.img
        src="/images/LOGO.png"
        alt="Loading..."
        animate={{ rotate: 360 }}
        transition={{ loop: Infinity, ease: "linear", duration: 1.5 }}
        style={{
          height: '50px', // Adjust size as needed
          filter: 'invert(39%) sepia(95%) saturate(1400%) hue-rotate(185deg) brightness(100%) contrast(101%)', // CSS filter for blue color
          marginTop: '10px' // Add small top margin to lower the logo slightly
        }}
      />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  );
};

export default Loader;