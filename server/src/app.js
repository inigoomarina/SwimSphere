require('dotenv').config();
const express = require('express');
// const mongoose = require('mongoose'); // Remove direct mongoose import for connection
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); // Changed from './routes/users' to './routes/user'
const leaderboardRoutes = require('./routes/leaderboard');
const uploadRoutes = require('./routes/upload'); // Import upload routes
const postRoutes = require('./routes/posts'); // Import post routes
const followRoutes = require('./routes/follow'); // Import follow routes
const dashboardRoutes = require('./routes/dashboard'); // Import dashboard routes
const chatRoutes = require('./routes/chat'); // Import chat routes
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); // Import path module
const connectDB = require('./config/database'); // Import connectDB
const jwt = require('jsonwebtoken'); // Import jwt for token verification

const app = express();
const PORT = process.env.PORT || 5001; // Change from 5000 to 5001 or another available port

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection using connectDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/upload', uploadRoutes); // Add route for uploads
app.use('/api/follow', followRoutes); // Add route for follows
app.use('/api/dashboard', dashboardRoutes); // Add dashboard routes
app.use('/api/chat', chatRoutes); // Add chat routes

// Middleware to ensure valid timestamps for posts
app.use('/api/posts', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    // Ensure createdAt is a valid date for new posts
    if (!req.body.createdAt) {
      req.body.createdAt = new Date();
    } else {
      // Make sure existing timestamp is valid
      try {
        req.body.createdAt = new Date(req.body.createdAt);
      } catch (e) {
        req.body.createdAt = new Date();
      }
    }
    
    // Always set updatedAt to current time on modifications
    req.body.updatedAt = new Date();
  }
  next();
});

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SwimSphere API' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected, ID:', socket.id);
  
  // Extract user ID from auth token
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      // Join a room with the user's ID
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
      
      // Store user ID with socket
      socket.userId = userId;
      
      // Handle chat messages
      socket.on('send_message', async (data) => {
        const { recipientId, text } = data;
        
        try {
          // Save message to database
          const Chat = require('./models/Chat');
          
          // Find or create chat
          let chat = await Chat.findOne({
            participants: { $all: [userId, recipientId] }
          });
          
          if (!chat) {
            chat = new Chat({
              participants: [userId, recipientId],
              messages: []
            });
          }
          
          // Add message
          chat.messages.push({
            sender: userId,
            text,
            timestamp: new Date(),
            read: false
          });
          
          await chat.save();
          
          // Get sender info for the response
          const User = require('./models/User');
          const sender = await User.findById(userId)
            .select('username firstName lastName profileImage');
          
          const messageData = {
            id: chat.messages[chat.messages.length - 1]._id,
            senderId: userId,
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
          
          // Send message to recipient room
          io.to(recipientId).emit('receive_message', messageData);
          
          // Send confirmation back to sender
          socket.emit('message_sent', {
            messageId: chat.messages[chat.messages.length - 1]._id,
            recipientId,
            timestamp: new Date()
          });
          
        } catch (error) {
          console.error('Error handling message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });
      
      // Handle typing indicators
      socket.on('typing', (data) => {
        const { recipientId, isTyping } = data;
        io.to(recipientId).emit('user_typing', {
          userId,
          isTyping
        });
      });
    }
  } catch (error) {
    console.error('Socket authentication error:', error);
  }
  
  socket.on('disconnect', () => {
    console.log('Client disconnected, ID:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use. Please stop the other process or change the port.`);
  } else {
    console.error('Server startup error:', err);
  }
  process.exit(1); // Exit the process if the server can't start
});

module.exports = { app, io };