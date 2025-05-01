const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { generateResponse } = require('../utils/helpers');

// Store active users
const activeUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

// Setup Socket.io connection and event handlers
exports.setupSocketIO = (io) => {
    io.use(async (socket, next) => {
        try {
            // Authenticate socket connection using JWT token
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: Token missing'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }
            
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);
        
        // Add user to active users
        activeUsers.set(socket.userId, socket.id);
        userSockets.set(socket.id, socket.userId);
        
        // Emit online users list to the connected user
        emitOnlineUsers(io);
        
        // Handle chat message
        socket.on('send_message', async (data) => {
            try {
                const { recipientId, content } = data;
                
                // Save message to database
                const newMessage = new Message({
                    senderId: socket.userId,
                    recipientId,
                    content,
                    timestamp: new Date()
                });
                
                await newMessage.save();
                
                // Send to recipient if online
                const recipientSocketId = activeUsers.get(recipientId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('receive_message', {
                        _id: newMessage._id,
                        senderId: socket.userId,
                        senderName: socket.user.username,
                        content,
                        timestamp: newMessage.timestamp
                    });
                }
                
                // Send confirmation back to sender
                socket.emit('message_sent', { 
                    messageId: newMessage._id,
                    recipientId,
                    timestamp: newMessage.timestamp
                });
            } catch (error) {
                socket.emit('error', { message: 'Error sending message' });
                console.error('Message sending error:', error);
            }
        });
        
        // Handle typing indicator
        socket.on('typing', (data) => {
            const { recipientId, isTyping } = data;
            
            // Send typing status to recipient if online
            const recipientSocketId = activeUsers.get(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user_typing', {
                    userId: socket.userId,
                    isTyping
                });
            }
        });
        
        // Handle getting conversation history
        socket.on('get_conversation', async (data) => {
            try {
                const { userId, page = 1, limit = 20 } = data;
                const skip = (page - 1) * limit;
                
                // Get messages between the two users
                const messages = await Message.find({
                    $or: [
                        { senderId: socket.userId, recipientId: userId },
                        { senderId: userId, recipientId: socket.userId }
                    ]
                })
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
                
                socket.emit('conversation_history', {
                    userId,
                    messages: messages.reverse(),
                    page,
                    hasMore: messages.length === parseInt(limit)
                });
            } catch (error) {
                socket.emit('error', { message: 'Error retrieving conversation' });
                console.error('Get conversation error:', error);
            }
        });
        
        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            
            // Remove user from active users
            activeUsers.delete(socket.userId);
            userSockets.delete(socket.id);
            
            // Update online users list
            emitOnlineUsers(io);
        });
    });
    
    // Function to emit online users to all connected clients
    function emitOnlineUsers(io) {
        io.emit('online_users', Array.from(activeUsers.keys()));
    }
};

// Get chat history between current user and another user
exports.getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        
        // Find or create chat between the two users
        let chat = await Chat.findOne({
            participants: { $all: [req.user.id, userId] }
        })
        .populate({
            path: 'messages.sender',
            select: 'username firstName lastName profileImage'
        });
        
        if (!chat) {
            // No chat history yet, return empty array
            return res.json(generateResponse('success', 'No chat history', { 
                messages: [],
                hasMore: false
            }));
        }
        
        // Sort messages in reverse chronological order and paginate
        const messages = chat.messages
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(skip, skip + parseInt(limit))
            .reverse(); // Reverse again to get chronological order
        
        // Mark messages as read
        const unreadMessages = chat.messages.filter(msg => 
            msg.sender._id.toString() !== req.user.id && 
            !msg.read
        );
        
        if (unreadMessages.length > 0) {
            unreadMessages.forEach(msg => {
                msg.read = true;
            });
            
            await chat.save();
        }
        
        res.json(generateResponse('success', 'Chat history retrieved', {
            messages,
            hasMore: chat.messages.length > skip + messages.length
        }));
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving chat history'));
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        
        const chat = await Chat.findOne({
            participants: { $all: [req.user.id, senderId] }
        });
        
        if (!chat) {
            return res.status(404).json(generateResponse('error', 'Chat not found'));
        }
        
        // Mark all messages from the sender as read
        let updateCount = 0;
        chat.messages.forEach(msg => {
            if (msg.sender.toString() === senderId && !msg.read) {
                msg.read = true;
                updateCount++;
            }
        });
        
        if (updateCount > 0) {
            await chat.save();
        }
        
        res.json(generateResponse('success', 'Messages marked as read', { count: updateCount }));
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json(generateResponse('error', 'Error marking messages as read'));
    }
};

// Create or update a chat
exports.createOrUpdateChat = async (req, res) => {
    try {
        const { userId } = req.params;
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json(generateResponse('error', 'Message text is required'));
        }
        
        // Check if chat already exists
        let chat = await Chat.findOne({
            participants: { $all: [req.user.id, userId] }
        });
        
        if (!chat) {
            // Create new chat
            chat = new Chat({
                participants: [req.user.id, userId],
                messages: [{
                    sender: req.user.id,
                    text,
                    timestamp: new Date(),
                    read: false
                }]
            });
        } else {
            // Add message to existing chat
            chat.messages.push({
                sender: req.user.id,
                text,
                timestamp: new Date(),
                read: false
            });
        }
        
        await chat.save();
        
        // Update user chat references if needed
        await Promise.all([
            User.updateOne(
                { _id: req.user.id, chats: { $ne: chat._id } },
                { $push: { chats: chat._id } }
            ),
            User.updateOne(
                { _id: userId, chats: { $ne: chat._id } },
                { $push: { chats: chat._id } }
            )
        ]);
        
        // Get the sender info
        const sender = await User.findById(req.user.id)
            .select('username firstName lastName profileImage');
        
        const newMessage = {
            id: chat.messages[chat.messages.length - 1]._id,
            text,
            timestamp: new Date(),
            sender: {
                id: sender._id,
                username: sender.username,
                firstName: sender.firstName,
                lastName: sender.lastName,
                profileImage: sender.profileImage || '/images/default-avatar.png'
            }
        };
        
        res.json(generateResponse('success', 'Message sent', newMessage));
        
    } catch (error) {
        console.error('Create/update chat error:', error);
        res.status(500).json(generateResponse('error', 'Error sending message'));
    }
};

// Get all conversations for current user
exports.getConversations = async (req, res) => {
    try {
        // Find all chats where the current user is a participant
        const chats = await Chat.find({
            participants: req.user.id
        })
        .populate('participants', 'username firstName lastName profileImage')
        .sort({ lastUpdated: -1 });
        
        // Format conversations for frontend
        const conversations = chats.map(chat => {
            // Get the other participant (not the current user)
            const otherParticipant = chat.participants.find(
                participant => participant._id.toString() !== req.user.id
            );
            
            // Get last message
            const lastMessage = chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1]
                : null;
            
            // Count unread messages
            const unreadCount = chat.messages.filter(
                msg => msg.sender.toString() !== req.user.id && !msg.read
            ).length;
            
            return {
                id: chat._id,
                userId: otherParticipant._id,
                username: otherParticipant.username,
                fullName: `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || otherParticipant.username,
                profileImage: otherParticipant.profileImage || '/images/default-avatar.png',
                lastMessage: lastMessage ? lastMessage.text : null,
                lastUpdated: lastMessage ? lastMessage.timestamp : chat.lastUpdated,
                unreadCount
            };
        });
        
        res.json(generateResponse('success', 'Conversations retrieved', conversations));
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving conversations'));
    }
};
