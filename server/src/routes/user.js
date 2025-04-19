const express = require('express');
const { 
    getUserProfile,
    updateUserProfile,
    addSwimTime,
    getSwimTimes,
    deleteSwimTime,
    addAchievement,
    searchUsers
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Profile routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

// Swim time routes
router.post('/swim-times', authenticate, addSwimTime);
router.get('/swim-times', authenticate, getSwimTimes);
router.delete('/swim-times/:timeId', authenticate, deleteSwimTime);

// Achievement routes
router.post('/achievements', authenticate, addAchievement);

// User search route
router.get('/search', authenticate, searchUsers);

module.exports = router;