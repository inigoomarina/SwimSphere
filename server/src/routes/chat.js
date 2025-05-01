const express = require('express');
const { 
    getConversations, 
    markAsRead, 
    getChatHistory,
    createOrUpdateChat
} = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations for the authenticated user
router.get('/conversations', getConversations);

// Get chat history with specific user
router.get('/:userId', getChatHistory);

// Mark messages as read
router.put('/read/:senderId', markAsRead);

// Create or update a chat
router.post('/:userId', createOrUpdateChat);

module.exports = router;
