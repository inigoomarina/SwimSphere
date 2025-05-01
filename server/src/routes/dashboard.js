const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

// GET feed posts for dashboard - This route is now handled by /api/posts

// Add other dashboard-specific routes here if needed in the future

module.exports = router;
