import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import io from 'socket.io-client';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState({});
    const [activeConversation, setActiveConversation] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    
    // Initialize socket connection when user is authenticated
    useEffect(() => {
        if (user && user.token) {
            // Connect to the socket server with auth token
            const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
                query: { token: user.token },
                transports: ['websocket']
            });
            
            setSocket(newSocket);
            
            return () => {
                if (newSocket) newSocket.disconnect();
            };
        }
    }, [user]);
    
    // Set up socket event listeners
    useEffect(() => {
        if (!socket) return;
        
        // Handle successful connection
        socket.on('connect', () => {
            console.log('Connected to chat server');
        });
        
        // Handle online users updates
        socket.on('online_users', (users) => {
            setOnlineUsers(users);
        });
        
        // Handle receiving messages
        socket.on('receive_message', (message) => {
            // Update messages for the relevant conversation
            setMessages(prev => {
                const senderId = message.senderId;
                const conversationMessages = prev[senderId] || [];
                
                return {
                    ...prev,
                    [senderId]: [...conversationMessages, message]
                };
            });
            
            // Update unread counter if not the active conversation
            if (message.senderId !== activeConversation) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [message.senderId]: (prev[message.senderId] || 0) + 1
                }));
            }
            
            // Update conversation list to put this one at top
            setConversations(prev => {
                // Remove the existing conversation if it exists
                const filtered = prev.filter(conv => conv.userId !== message.senderId);
                
                // Add it back at the beginning of the array
                return [
                    { 
                        userId: message.senderId,
                        lastMessage: message.content,
                        lastTimestamp: message.timestamp
                    },
                    ...filtered
                ];
            });
        });
        
        // Handle conversation history response
        socket.on('conversation_history', (data) => {
            const { userId, messages: historyMessages, page } = data;
            
            setMessages(prev => {
                const existingMessages = prev[userId] || [];
                
                // If it's the first page, replace messages, otherwise prepend
                if (page === 1) {
                    return { ...prev, [userId]: historyMessages };
                } else {
                    return { ...prev, [userId]: [...historyMessages, ...existingMessages] };
                }
            });
        });
        
        // Handle typing indicators
        socket.on('user_typing', (data) => {
            const { userId, isTyping } = data;
            
            setTypingUsers(prev => ({
                ...prev,
                [userId]: isTyping
            }));
        });
        
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
        });
        
        return () => {
            socket.off('connect');
            socket.off('online_users');
            socket.off('receive_message');
            socket.off('conversation_history');
            socket.off('user_typing');
            socket.off('disconnect');
        };
    }, [socket, activeConversation]);
    
    const loadConversation = (userId) => {
        if (!socket) return;
        
        // Set the active conversation
        setActiveConversation(userId);
        
        // Reset unread counter for this conversation
        setUnreadCounts(prev => ({
            ...prev,
            [userId]: 0
        }));
        
        // Request conversation history
        socket.emit('get_conversation', { userId, page: 1 });
    };
    
    const sendMessage = (recipientId, content) => {
        if (!socket) return;
        
        socket.emit('send_message', { recipientId, content });
        
        // Optimistically add message to local state
        const newMessage = {
            _id: Date.now().toString(), // Temporary ID
            senderId: user.id,
            recipientId,
            content,
            timestamp: new Date(),
            read: false
        };
        
        // Add to message list
        setMessages(prev => {
            const conversationMessages = prev[recipientId] || [];
            return {
                ...prev,
                [recipientId]: [...conversationMessages, newMessage]
            };
        });
        
        // Update conversation list
        setConversations(prev => {
            // Remove the existing conversation if it exists
            const filtered = prev.filter(conv => conv.userId !== recipientId);
            
            // Add new conversation or update existing one
            return [
                { userId: recipientId, lastMessage: content, lastTimestamp: new Date() },
                ...filtered
            ];
        });
    };
    
    const setTyping = (recipientId, isTyping) => {
        if (socket) {
            socket.emit('typing', { recipientId, isTyping });
        }
    };
    
    const loadMoreMessages = (userId, page) => {
        if (socket) {
            socket.emit('get_conversation', { userId, page });
        }
    };

    return (
        <ChatContext.Provider value={{
            conversations,
            activeConversation,
            messages,
            onlineUsers,
            typingUsers,
            unreadCounts,
            loadConversation,
            sendMessage,
            setTyping,
            loadMoreMessages,
            totalUnreadCount: Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);

export default ChatContext;
