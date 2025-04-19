const express = require('express');
const { 
    getLeaderboard,
    submitTime,
    getUserBests,
    deleteEntry
} = require('../controllers/leaderboardController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getLeaderboard);

// User routes (require authentication)
router.post('/submit', authenticate, submitTime);
router.get('/user/:userId?', authenticate, getUserBests);

// Admin routes
router.delete('/:id', authenticate, isAdmin, deleteEntry);

module.exports = router;
