const express = require('express');
const {
    createPost,
    getFeedPosts,
    getUserPosts,
    toggleLike,
    addComment,
    deletePost,
    deleteComment
} = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All post-related routes require authentication
router.use(authenticate);

// POST /api/posts - Create a new post
router.post('/', createPost);

// GET /api/posts - Get feed posts (uses getFeedPosts from controller)
// Note: This route was previously handled by dashboardController, consolidating here.
router.get('/', getFeedPosts);

// GET /api/posts/user/:userId - Get posts by a specific user
router.get('/user/:userId', getUserPosts);

// POST /api/posts/:postId/like - Toggle like on a post
router.post('/:postId/like', toggleLike);

// POST /api/posts/:postId/comments - Add a comment to a post
router.post('/:postId/comments', addComment);

// DELETE /api/posts/:postId - Delete a post
router.delete('/:postId', deletePost);

// DELETE /api/posts/:postId/comments/:commentId - Delete a comment
router.delete('/:postId/comments/:commentId', deleteComment);


module.exports = router;
