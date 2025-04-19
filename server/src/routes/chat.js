const express = require('express');
const { getConversations, markAsRead } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations for the authenticated user
router.get('/conversations', getConversations);

// Mark messages as read
router.put('/read/:senderId', markAsRead);

module.exports = router;
