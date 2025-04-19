import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import Button from '../common/Button';

const ChatComponent = () => {
    const { 
        messages, 
        conversations, 
        activeConversation, 
        openConversation, 
        sendMessage,
        loadMoreMessages,
        totalUnreadCount,
        isTyping,
        setTyping
    } = useChat();
    
    const [messageText, setMessageText] = useState('');
    const [page, setPage] = useState(1);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

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

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <h3>Conversations</h3>
                <div className="conversation-list">
                    {conversations.length > 0 ? (
                        conversations.map(conversation => (
                            <div 
                                key={conversation.userId} 
                                className={`conversation-item ${activeConversation === conversation.userId ? 'active' : ''}`}
                                onClick={() => openConversation(conversation.userId)}
                            >
                                <div className="conversation-avatar">
                                    <img src={conversation.profileImage || '/default-avatar.png'} alt={conversation.username || 'User'} />
                                </div>
                                <div className="conversation-info">
                                    <span className="conversation-name">{conversation.fullName || conversation.username || 'User'}</span>
                                    <span className="conversation-last-message">{conversation.lastMessage || 'Start a conversation'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-conversations">
                            <p>No conversations yet</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="chat-main">
                {activeConversation ? (
                    <>
                        <div className="chat-header">
                            <span>Chat</span>
                        </div>
                        
                        <div className="messages-container">
                            <button 
                                onClick={handleLoadMore}
                                className="load-more-btn"
                            >
                                Load more
                            </button>
                            
                            <div className="messages-list">
                                {messages[activeConversation]?.map((message, index) => (
                                    <div 
                                        key={message._id || index}
                                        className={`message ${message.senderId === 'currentUser' ? 'sent' : 'received'}`}
                                    >
                                        <div className="message-content">{message.content}</div>
                                        <div className="message-time">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            
                            {isTyping[activeConversation] && (
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            )}
                        </div>
                        
                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                value={messageText}
                                onChange={handleInputChange}
                                placeholder="Type a message..."
                                className="message-input"
                            />
                            <Button type="submit" className="send-button">
                                Send
                            </Button>
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
