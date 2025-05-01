import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({ placeholder = "Search users...", className = "", onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const resultsRef = useRef(null);

    // Search for users when query changes
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    const response = await searchUsers(query);
                    if (response.status === 'success') {
                        setResults(response.data);
                    } else {
                        setResults([]);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchRef]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setShowResults(true);
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    const handleResultClick = (user) => {
        if (onSelect) {
            onSelect(user);
        }
        clearSearch();
    };

    return (
        <div className={`search-bar-container ${className}`} ref={searchRef}>
            <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setShowResults(true)}
                    className="search-input"
                />
                {query && (
                    <button className="clear-search-btn" onClick={clearSearch}>
                        <FaTimes />
                    </button>
                )}
            </div>
            
            <AnimatePresence>
                {showResults && (
                    <motion.div 
                        className="search-results"
                        ref={resultsRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {loading ? (
                            <div className="search-loading">
                                <div className="loading-spinner"></div>
                                <p>Searching...</p>
                            </div>
                        ) : results.length > 0 ? (
                            results.map(user => (
                                <Link 
                                    to={`/profile/${user.id}`} 
                                    key={user.id}
                                    className="search-result-item"
                                    onClick={() => handleResultClick(user)}
                                >
                                    <img 
                                        src={user.profileImage || "/images/default-avatar.png"} 
                                        alt={user.name} 
                                        className="user-avatar"
                                    />
                                    <div className="user-info">
                                        <div className="user-name">{user.name}</div>
                                        <div className="user-username">{user.formattedUsername}</div>
                                    </div>
                                </Link>
                            ))
                        ) : query.length >= 2 ? (
                            <div className="no-results">
                                <p>No results found</p>
                            </div>
                        ) : query.length > 0 ? (
                            <div className="search-hint">
                                <p>Enter at least 2 characters to search</p>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;
