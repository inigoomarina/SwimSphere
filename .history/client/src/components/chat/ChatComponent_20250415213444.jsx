import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import './ChatComponent.css';

const ChatComponent = () => {
    const {
        conversations,
        activeConversation,
        messages,
        onlineUsers,
        typingUsers,
        unreadCounts,
        loadConversation,
        sendMessage,
        setTyping,
        loadMoreMessages
    } = useChat();
    
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    const filteredConversations = conversations.filter(conversation => 
        conversation.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conversation.fullName && conversation.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeConversation, messages]);
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageText.trim() && activeConversation) {
            sendMessage(activeConversation, messageText);
            setMessageText('');
        }
    };
    
    const handleInputChange = (e) => {
        setMessageText(e.target.value);
        
        // Handle typing indicator
        if (activeConversation) {
            setTyping(activeConversation, true);
            
            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            // Set typing to false after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                setTyping(activeConversation, false);
            }, 2000);
        }
    };
    
    const handleLoadMore = () => {
        if (activeConversation) {
            const nextPage = page + 1;
            loadMoreMessages(activeConversation, nextPage);
            setPage(nextPage);
        }
    };
    
    const getActiveUser = () => {
        return conversations.find(c => c.userId === activeConversation);
    };
    
    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };
    
    const isUserTyping = (userId) => {
        return typingUsers[userId] || false;
    };
    
    const getUnreadCount = (userId) => {
        return unreadCounts[userId] || 0;
    };
    
    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="chat-search">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="conversations-list">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map((conversation) => (
                            <div 
                                key={conversation.userId}
                                className={`conversation-item ${activeConversation === conversation.userId ? 'active' : ''}`}
                                onClick={() => loadConversation(conversation.userId)}
                            >
                                <div className="conversation-avatar">
                                    <img src={conversation.profileImage} alt={conversation.username} />
                                    <span className={`status-indicator ${isUserOnline(conversation.userId) ? 'online' : 'offline'}`}></span>
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-header">
                                        <h4>{conversation.fullName || conversation.username}</h4>
                                        <span className="conversation-time">
                                            {formatDistanceToNow(new Date(conversation.lastTimestamp), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="conversation-last-message">{conversation.lastMessage}</p>
                                </div>
                                {getUnreadCount(conversation.userId) > 0 && (
                                    <div className="unread-badge">{getUnreadCount(conversation.userId)}</div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-conversations">
                            <p>No conversations found</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="chat-main">
                {activeConversation ? (
                    <>
                        <div className="chat-header">
                            {getActiveUser() && (
                                <>
                                    <img 
                                        src={getActiveUser().profileImage} 
                                        alt={getActiveUser().username} 
                                        className="user-avatar" 
                                    />
                                    <div className="user-info">
                                        <h3>{getActiveUser().fullName || getActiveUser().username}</h3>
                                        <p className={`user-status ${isUserOnline(activeConversation) ? 'online' : 'offline'}`}>
                                            {isUserOnline(activeConversation) ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="messages-container">
                            <button 
                                className="load-more-btn" 
                                onClick={handleLoadMore}
                            >
                                Load more messages
                            </button>
                            
                            {messages[activeConversation] && messages[activeConversation].length > 0 ? (
                                <div className="messages-list">
                                    {messages[activeConversation].map((message, index) => (
                                        <div 
                                            key={message._id || index}
                                            className={`message ${message.senderId === activeConversation ? 'received' : 'sent'}`}
                                        >
                                            <div className="message-content">
                                                {message.content}
                                            </div>
                                            <div className="message-time">
                                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                            </div>
                                        </div>
                                    ))}
                                    {isUserTyping(activeConversation) && (
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            ) : (
                                <div className="no-messages">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            )}
                        </div>
                        
                        <form className="message-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={messageText}
                                onChange={handleInputChange}
                            />
                            <button type="submit" disabled={!messageText.trim()}>
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-active-conversation">
                        <div className="welcome-message">
                            <h2>Welcome to SwimSphere Chat</h2>
                            <p>Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatComponent;
