import React, { useState, useEffect } from 'react';
import { getFollowingUsers } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import './ChatStyles.css';

const ChatList = ({ 
    conversations = [],
    activeConversation,
    onSelectConversation,
    unreadCounts = {},
    onlineUsers = []
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [followingUsers, setFollowingUsers] = useState([]);
    const [showingFollowing, setShowingFollowing] = useState(false);
    
    // Load following users for new chat
    useEffect(() => {
        const loadFollowingUsers = async () => {
            try {
                const response = await getFollowingUsers();
                if (response.status === 'success') {
                    setFollowingUsers(response.data);
                }
            } catch (error) {
                console.error('Error loading following users:', error);
            }
        };
        
        loadFollowingUsers();
    }, []);
    
    // Filter conversations based on search query
    const filteredItems = showingFollowing 
        ? followingUsers.filter(user => 
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.username?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : conversations.filter(conversation => 
            conversation.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            conversation.username?.toLowerCase().includes(searchQuery.toLowerCase())
          );
    
    const getUnreadCount = (userId) => unreadCounts[userId] || 0;
    
    const isUserOnline = (userId) => onlineUsers.includes(userId);
    
    const handleUserSelect = (user) => {
        onSelectConversation(user.id || user.userId);
        setShowingFollowing(false);
    };
    
    const toggleView = () => {
        setShowingFollowing(!showingFollowing);
        setSearchQuery('');
    };
    
    return (
        <div className="chat-list-container">
            <div className="chat-list-header">
                <h3>{showingFollowing ? 'New Message' : 'Messages'}</h3>
                <button 
                    className="toggle-view-btn" 
                    onClick={toggleView}
                >
                    {showingFollowing ? 'Back to conversations' : 'New message'}
                </button>
            </div>
            
            <div className="chat-search">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder={showingFollowing ? "Search people you follow..." : "Search conversations..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="chat-search-input"
                />
            </div>
            
            <div className="conversation-list">
                <AnimatePresence>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <motion.div 
                                key={item.id || item.userId}
                                className={`conversation-item ${activeConversation === (item.id || item.userId) ? 'active' : ''}`}
                                onClick={() => handleUserSelect(item)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="conversation-avatar">
                                    <img 
                                        src={item.profileImage || '/images/default-avatar.png'} 
                                        alt={item.username || item.name || 'User'} 
                                    />
                                    <div className={`status-indicator ${isUserOnline(item.id || item.userId) ? 'online' : 'offline'}`}></div>
                                </div>
                                
                                <div className="conversation-info">
                                    <div className="conversation-header">
                                        <h4>{item.fullName || item.name || item.username || 'User'}</h4>
                                        {!showingFollowing && item.lastUpdated && (
                                            <span className="conversation-time">
                                                {formatDistanceToNow(new Date(item.lastUpdated), { addSuffix: true })}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {!showingFollowing && (
                                        <p className="conversation-last-message">
                                            {item.lastMessage || 'Start a conversation'}
                                        </p>
                                    )}
                                </div>
                                
                                {!showingFollowing && getUnreadCount(item.userId) > 0 && (
                                    <div className="unread-badge">{getUnreadCount(item.userId)}</div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="no-conversations">
                            <p>{showingFollowing 
                                ? 'No people you follow match your search' 
                                : 'No conversations found'}</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ChatList;
