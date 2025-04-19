import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { searchUsers, toggleFollowUser } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import './SearchBar.css';

const SearchBar = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFollowingInProgress, setIsFollowingInProgress] = useState({});
    const searchTimeout = useRef(null);
    const inputRef = useRef(null);
    const resultsContainerRef = useRef(null);
    const { showToast } = useToast();
    const history = useHistory();
    
    // Handle search query changes with debounce
    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        if (!query || query.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        
        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await searchUsers(query);
                if (response.status === 'success') {
                    setResults(response.data);
                } else {
                    showToast('Failed to search users', 'error');
                }
            } catch (err) {
                console.error('Search error:', err);
                showToast('Search failed', 'error');
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce
        
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [query, showToast]);
    
    // Auto-focus the search input
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);
    
    // Handle clicks outside of search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (resultsContainerRef.current && !resultsContainerRef.current.contains(event.target)) {
                if (onClose && typeof onClose === 'function') {
                    onClose();
                }
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    
    const handleToggleFollow = async (userId, isFollowing, event) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (isFollowingInProgress[userId]) return;
        
        try {
            setIsFollowingInProgress(prev => ({ ...prev, [userId]: true }));
            
            console.log("Toggling follow for user:", userId);
            const response = await toggleFollowUser(userId);
            console.log("Follow response:", response);
            
            if (response.status === 'success') {
                // Update the followed status in the results
                setResults(prev => prev.map(user => 
                    user.id === userId ? { ...user, isFollowing: !isFollowing } : user
                ));
                
                showToast(
                    isFollowing 
                        ? `Unfollowed user successfully` 
                        : `Following user successfully`
                );
            } else {
                showToast('Failed to update follow status', 'error');
            }
        } catch (err) {
            console.error('Follow toggle error:', err);
            showToast('Failed to update follow status', 'error');
        } finally {
            setIsFollowingInProgress(prev => ({ ...prev, [userId]: false }));
        }
    };
    
    const handleUserClick = (userId) => {
        history.push(`/profile/${userId}`);
        if (onClose && typeof onClose === 'function') {
            onClose();
        }
    };
    
    return (
        <div className="search-container" ref={resultsContainerRef}>
            <div className="search-input-wrapper">
                <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search for swimmers, coaches..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button 
                        className="clear-search-btn" 
                        onClick={() => setQuery('')}
                    >
                        &times;
                    </button>
                )}
            </div>
            
            {(results.length > 0 || loading) && (
                <div className="search-results">
                    {loading && (
                        <div className="search-loading">Searching...</div>
                    )}
                    
                    {!loading && results.length > 0 && (
                        <>
                            {results.map(user => (
                                <div 
                                    key={user.id} 
                                    className="search-result-card"
                                    onClick={() => handleUserClick(user.id)}
                                >
                                    <img 
                                        src={user.profileImage || "/default-avatar.png"} 
                                        alt={user.name} 
                                        className="result-avatar"
                                    />
                                    <div className="result-details">
                                        <span className="result-name">{user.name}</span>
                                        <span className="result-username">@{user.username}</span>
                                        {user.swimTeam && (
                                            <span className="result-team">{user.swimTeam}</span>
                                        )}
                                    </div>
                                    <button 
                                        className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
                                        onClick={(e) => handleToggleFollow(user.id, user.isFollowing, e)}
                                        disabled={isFollowingInProgress[user.id]}
                                    >
                                        {isFollowingInProgress[user.id] ? (
                                            <span className="loading-spinner-small"></span>
                                        ) : user.isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))}
                        </>
                    )}
                    
                    {!loading && query.length >= 2 && results.length === 0 && (
                        <div className="no-results">
                            No users found matching "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
