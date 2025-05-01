import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer bg-gray-800 text-white mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold">swimsphere</span>
              <img 
                src="/images/LOGO.png" 
                alt="SwimSphere Logo" 
                className="h-5 ml-1" 
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="text-sm">Your ultimate swimming community platform</p>
          </div>
          
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-blue-300 transition">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-300 transition">Dashboard</Link></li>
              <li><Link to="/leaderboard" className="hover:text-blue-300 transition">Leaderboards</Link></li>
              <li><Link to="/records" className="hover:text-blue-300 transition">Records</Link></li>
            </ul>
          </div>
          
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-blue-300 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-300 transition">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div className="w-full md:w-1/4">
            <h4 className="text-lg font-semibold mb-3">Connect</h4>
            <div className="flex space-x-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition">
                <i className="fab fa-facebook"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-center">
          &copy; {currentYear} SwimSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;