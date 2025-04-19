import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState({});
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [page, setPage] = useState(1);
  const [isTyping, setIsTyping] = useState({});
  const typingTimeoutRef = useRef({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Calculate total unread count whenever unreadCounts changes
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
  };

  return (
    <ChatContext.Provider value={{
      messages,
      conversations,
      activeConversation,
      onlineUsers,
      unreadCounts,
      totalUnreadCount,
      isTyping,
      openConversation,
      sendMessage,
      loadMoreMessages,
      setTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};
