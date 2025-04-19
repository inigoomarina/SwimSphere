require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); // Changed from './routes/users' to './routes/user'
const leaderboardRoutes = require('./routes/leaderboard');
const uploadRoutes = require('./routes/upload'); // Import upload routes
const postRoutes = require('./routes/posts'); // Import post routes
const followRoutes = require('./routes/follow'); // Import follow routes
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); // Import path module

const app = express();
const PORT = process.env.PORT || 5000;

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

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swimsphere')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/upload', uploadRoutes); // Add route for uploads
app.use('/api/follow', followRoutes); // Add route for follows

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
  
  socket.on('disconnect', () => {
    console.log('Client disconnected, ID:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };