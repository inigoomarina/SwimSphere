import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import SearchBar from '../search/SearchBar';

const Header = () => {
    const { user } = useContext(AuthContext);
    const { totalUnreadCount } = useChat();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const dropdownRef = useRef(null);
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };
    
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        
        // Close mobile menu if open
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
        
        // Close dropdown if open
        if (dropdownOpen) {
            setDropdownOpen(false);
        }
    };
    
    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);
    
    return (
        <header className="bg-white shadow-md fixed top-0 w-full z-10">
            <div className="container mx-auto px-4 py-2">
                <div className="flex justify-between items-center">
                    {/* Logo and Text */}
                    {/* Use items-center for vertical centering */}
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-bold text-primary">swimsphere</span>
                        {/* Adjust height and margin */}
                        <img
                            src="/images/LOGO.png"
                            alt="SwimSphere Logo"
                            className="h-5 ml-1" // Reduced height and margin
                            style={{
                                filter: 'invert(39%) sepia(95%) saturate(1400%) hue-rotate(185deg) brightness(100%) contrast(101%)' // CSS filter for primary blue color
                            }}
                        />
                    </Link>
                    
                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:block flex-grow max-w-md mx-4">
                        {showSearch ? (
                            <SearchBar onClose={() => setShowSearch(false)} />
                        ) : (
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search swimmers, teams, events..." 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    onClick={toggleSearch}
                                />
                                <button className="absolute right-3 top-2" onClick={toggleSearch}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Right side icons and profile */}
                    <div className="flex items-center">
                        
                        {/* Desktop Navigation Icons */}
                        <nav className="hidden md:flex items-center space-x-4">
                            <Link to="/dashboard" className="text-gray-700 hover:text-primary" title="Dashboard">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="h-6 w-6" fill="currentColor">
                                    <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
                                </svg>
                            </Link>
                            <Link to="/chat" className="text-gray-700 hover:text-primary relative" title="Messages">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="h-6 w-6" fill="currentColor">
                                    <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
                                </svg>
                                {totalUnreadCount > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                    >
                                        {totalUnreadCount}
                                    </motion.span>
                                )}
                            </Link>
                            <Link to="/leaderboard" className="text-gray-700 hover:text-primary" title="Leaderboards">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="h-6 w-6" fill="currentColor">
                                    <path d="M160-200h160v-320H160v320Zm240 0h160v-560H400v560Zm240 0h160v-240H640v240ZM80-120v-480h240v-240h320v320h240v400H80Z" />
                                </svg>
                            </Link>
                            <Link to="/records" className="text-gray-700 hover:text-primary" title="Records">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="h-6 w-6" fill="currentColor">
                                    <path d="M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280Zm0-408v-152h-80v40q0 38 22 68.5t58 43.5Zm200 128q50 0 85-35t35-85v-240H360v240q0 50 35 85t85 35Zm200-128q36-13 58-43.5t22-68.5v-40h-80v152Zm-200-52Z" />
                                </svg>
                            </Link>
                        </nav>
                        
                        {/* Profile dropdown */}
                        {user ? (
                            <div className="relative ml-4" ref={dropdownRef}>
                                <button 
                                    onClick={toggleDropdown}
                                    className="flex items-center focus:outline-none"
                                >
                                    <img 
                                        src={user.profileImage || "/default-avatar.png"} 
                                        alt="Profile" 
                                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {dropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                                    >
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Profile
                                        </Link>
                                        {user.role === 'coach' && (
                                            <Link to="/coach" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Coach Dashboard
                                            </Link>
                                        )}
                                        <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Settings
                                        </Link>
                                        <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100">
                                            Logout
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center ml-4">
                                <Link to="/login" className="text-gray-700 hover:text-primary mr-4">Login</Link>
                                <Link to="/register" className="btn btn-primary">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Mobile search - only visible when mobile menu is open */}
            {mobileMenuOpen && (
                <div className="p-4 border-t border-gray-200 md:hidden">
                    {showSearch ? (
                        <SearchBar onClose={() => setShowSearch(false)} />
                    ) : (
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search swimmers, teams, events..." 
                                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                onClick={toggleSearch}
                            />
                            <button className="absolute right-3 top-2" onClick={toggleSearch}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <motion.nav 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden mt-1 bg-white border-t border-gray-200"
                >
                    <ul className="flex flex-col p-4 space-y-3">
                        <li><Link to="/" className="block hover:text-primary transition-colors" onClick={toggleMobileMenu}>Home</Link></li>
                        <li><Link to="/dashboard" className="block hover:text-primary transition-colors" onClick={toggleMobileMenu}>Dashboard</Link></li>
                        <li><Link to="/feed" className="block hover:text-primary transition-colors" onClick={toggleMobileMenu}>Feed</Link></li>
                        <li><Link to="/leaderboard" className="block hover:text-primary transition-colors" onClick={toggleMobileMenu}>Leaderboards</Link></li>
                        <li><Link to="/records" className="block hover:text-primary transition-colors" onClick={toggleMobileMenu}>Records</Link></li>
                        {user && (
                            <>
                                <li><Link to="/profile" className="block hover:text-primary transition-colors" onClick={toggleMobileMenu}>Profile</Link></li>
                                <li>
                                    <Link to="/chat" className="block hover:text-primary transition-colors relative" onClick={toggleMobileMenu}>
                                        Chat
                                        {totalUnreadCount > 0 && (
                                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                                {totalUnreadCount}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                                {user.role === 'coach' && (
                                    <li><Link to="/coach" className="block hover:text-primary transition-colors" onClick={toggleMobileMenu}>Coach Dashboard</Link></li>
                                )}
                            </>
                        )}
                    </ul>
                </motion.nav>
            )}
        </header>
    );
};

export default Header;