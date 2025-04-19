import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
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
                        {/* Mobile menu button */}
                        <button 
                            onClick={toggleMobileMenu}
                            className="md:hidden focus:outline-none mr-2"
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                                {mobileMenuOpen 
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                        
                        {/* Desktop Navigation Icons */}
                        <nav className="hidden md:flex items-center space-x-4">
                            <Link to="/dashboard" className="text-gray-700 hover:text-primary" title="Dashboard">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </Link>
                            <Link to="/feed" className="text-gray-700 hover:text-primary" title="Feed">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </Link>
                            <Link to="/leaderboard" className="text-gray-700 hover:text-primary" title="Leaderboards">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </Link>
                            <Link to="/records" className="text-gray-700 hover:text-primary" title="Records">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </Link>
                            <Link to="/chat" className="text-gray-700 hover:text-primary relative" title="Messages">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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