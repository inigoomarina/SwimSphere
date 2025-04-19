const express = require('express');
const { followUser, unfollowUser, getFollowCounts } = require('../controllers/followController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Follow/unfollow routes
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);

// Get follower/following counts
router.get('/counts/:userId', authenticate, getFollowCounts);

module.exports = router;
