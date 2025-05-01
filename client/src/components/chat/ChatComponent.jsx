import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaSearch, FaPaperPlane, FaPlusCircle } from 'react-icons/fa';
import './ChatComponent.css'; // Make sure CSS is imported

const ChatComponent = ({ conversations = [], messagesData = {}, currentUser }) => {
  const [activeConversationId, setActiveConversationId] = useState(conversations.length > 0 ? conversations[0].id : null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const prevConversationIdRef = useRef(activeConversationId); // Track previous conversation ID

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = messagesData[activeConversationId] || [];

  useEffect(() => {
    // Scroll to bottom only if messages changed for the *current* conversation
    // or if the conversation ID itself just changed (initial load of conversation)
    if (messagesEndRef.current) {
      if (prevConversationIdRef.current !== activeConversationId) {
        // If conversation changed, scroll immediately (not smoothly) to the bottom
        messagesEndRef.current.scrollIntoView();
        prevConversationIdRef.current = activeConversationId; // Update ref after scroll
      } else {
        // If only messages changed within the same conversation, scroll smoothly
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // We only want this effect to run when messages or activeConversationId changes.
    // prevConversationIdRef should not be in the dependency array.
  }, [messages, activeConversationId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() && activeConversationId) {
      console.log(`Sending message "${messageText}" to conversation ${activeConversationId}`);
      // Here you would typically call an API or context function to send the message
      // For demo, we just clear the input
      setMessageText('');
      messageInputRef.current?.focus();
    }
  };

  const handleConversationClick = (id) => {
    // Update the previous ID ref *before* setting the new active ID
    // This helps the useEffect differentiate between a switch and new messages
    prevConversationIdRef.current = activeConversationId; 
    setActiveConversationId(id);
    setMessageText(''); // Clear message input when switching conversations
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
           <h3>Messages</h3>
           <button className="new-chat-btn" title="New Chat">
             <FaPlusCircle />
           </button>
        </div>
        <div className="chat-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ul className="conversations-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <li
                key={conv.id}
                className={`conversation-item ${activeConversationId === conv.id ? 'active' : ''}`}
                onClick={() => handleConversationClick(conv.id)}
              >
                <div className="conversation-avatar">
                  <img src={conv.profileImage || '/default-avatar.png'} alt={conv.name} />
                  <span className={`status-indicator ${conv.online ? 'online' : 'offline'}`}></span>
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{conv.name}</h4>
                    <span className="conversation-time">{conv.time}</span>
                  </div>
                  <div className="conversation-preview">
                    <p className="conversation-last-message">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="unread-badge">{conv.unread}</span>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="no-conversations">No conversations found</li>
          )}
        </ul>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <img
                src={activeConversation.profileImage || '/default-avatar.png'}
                alt={activeConversation.name}
                className="user-avatar"
              />
              <div className="user-info">
                <h3>{activeConversation.name}</h3>
                <p className={`user-status ${activeConversation.online ? 'online' : 'offline'}`}>
                  {activeConversation.online ? 'Online' : 'Offline'}
                </p>
              </div>
              {/* Add more icons/buttons here if needed, e.g., call, info */}
            </div>

            <div className="messages-container">
              {/* Add load more button if needed */}
              {/* <button className="load-more-btn">Load older messages</button> */}
              <div className="messages-list">
                {messages.map(msg => (
                  <div key={msg.id} className={`message ${msg.type === 'sent' ? 'sent' : 'received'}`}>
                    {msg.content}
                    {/* Optionally add timestamp per message */}
                    {/* <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> */}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {/* Add typing indicator if needed */}
              {/* <div className="typing-indicator"><span></span><span></span><span></span></div> */}
            </div>

            <form className="message-form" onSubmit={handleSendMessage}>
              <input
                ref={messageInputRef}
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button type="submit" disabled={!messageText.trim()}>
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="no-active-conversation">
            <div className="welcome-message">
              <h2>Select a conversation</h2>
              <p>Choose someone from the list to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ChatComponent.propTypes = {
  conversations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    lastMessage: PropTypes.string,
    time: PropTypes.string,
    unread: PropTypes.number,
    profileImage: PropTypes.string,
    online: PropTypes.bool,
  })),
  messagesData: PropTypes.object, // { conversationId: [messageObject] }
  currentUser: PropTypes.object,
};

export default ChatComponent;
