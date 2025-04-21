import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext.jsx'; // Explicitly import .jsx

export const ChatContext = createContext();

// Add this export for the useChat hook
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState({});

  // Calculate total unread messages
  useEffect(() => {
    if (unreadCounts) {
      const total = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
      setTotalUnreadCount(total);
    }
  }, [unreadCounts]);

  // Basic functions to keep interface working
  const openConversation = (userId) => {
    setActiveConversation(userId);
    setPage(1);
    // Reset unread count for this conversation
    setUnreadCounts(prev => ({ ...prev, [userId]: 0 }));
  };

  const sendMessage = (recipientId, content) => {
    console.log("Sending message:", content, "to:", recipientId);
    // Implementation would connect to backend
  };

  const loadMoreMessages = (userId, nextPage) => {
    console.log("Loading more messages for user:", userId, "page:", nextPage);
    // Implementation would load from backend
  };

  const setTyping = (userId, isTyping) => {
    console.log("Set typing status for user:", userId, "to:", isTyping);
    // Implementation would notify backend
    setIsTyping(prev => ({
      ...prev,
      [userId]: isTyping
    }));
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      messages,
      onlineUsers,
      typingUsers,
      unreadCounts,
      totalUnreadCount,
      isTyping,
      page,
      searchQuery,
      setSearchQuery,
      openConversation,
      sendMessage,
      setTyping,
      loadMoreMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
