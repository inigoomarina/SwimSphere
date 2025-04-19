import React from 'react';
import { motion } from 'framer-motion';

const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  className = '', 
  direction = null
}) => {
  
  const directionVariants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  };
  
  const initialVariant = {
    opacity: 0,
    ...(direction && directionVariants[direction])
  };
  
  return (
    <motion.div
      initial={initialVariant}
      animate={{ 
        opacity: 1,
        y: 0,
        x: 0
      }}
      transition={{ 
        delay,
        duration,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
