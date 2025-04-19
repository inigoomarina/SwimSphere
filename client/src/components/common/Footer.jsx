import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-100 py-6"
        >
            <div className="container mx-auto px-4 text-center text-gray-600">
                <p>&copy; {new Date().getFullYear()} SwimSphere. All rights reserved.</p>
                <div className="mt-2 flex justify-center space-x-4">
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors">Terms</a>
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors">Privacy</a>
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors">Contact</a>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;