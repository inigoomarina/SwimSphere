const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
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

// Get recent conversations for a user
exports.getConversations = async (req, res) => {
    try {
        // Find users who have exchanged messages with the current user
        const messagedUsers = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: mongoose.Types.ObjectId(req.user.id) },
                        { recipientId: mongoose.Types.ObjectId(req.user.id) }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", mongoose.Types.ObjectId(req.user.id)] },
                            "$recipientId",
                            "$senderId"
                        ]
                    },
                    lastMessage: { $last: "$content" },
                    lastTimestamp: { $max: "$timestamp" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $eq: ["$recipientId", mongoose.Types.ObjectId(req.user.id)] },
                                    { $eq: ["$read", false] }
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { lastTimestamp: -1 } }
        ]);
        
        // Get user info for each conversation partner
        const userIds = messagedUsers.map(item => item._id);
        const users = await User.find({ _id: { $in: userIds } })
            .select('username firstName lastName profileImage');
        
        // Update default profile image in conversations
        const conversations = messagedUsers.map(item => {
            const user = users.find(u => u._id.toString() === item._id.toString());
            return {
                userId: user._id,
                username: user.username,
                fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
                profileImage: user.profileImage || '/images/default-avatar.png',
                lastMessage: item.lastMessage,
                lastTimestamp: item.lastTimestamp,
                unreadCount: item.unreadCount
            };
        });
        
        res.json(generateResponse('success', 'Conversations retrieved successfully', conversations));
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving conversations'));
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        
        await Message.updateMany(
            { senderId, recipientId: req.user.id, read: false },
            { $set: { read: true } }
        );
        
        res.json(generateResponse('success', 'Messages marked as read'));
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json(generateResponse('error', 'Error marking messages as read'));
    }
};
