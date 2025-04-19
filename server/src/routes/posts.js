const express = require('express');
const { 
    createPost, 
    getFeedPosts, 
    getUserPosts, 
    toggleLike, 
    addComment, 
    deleteComment, 
    deletePost 
} = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Post CRUD operations
router.post('/', createPost);
router.get('/', getFeedPosts);
router.get('/user/:userId', getUserPosts);
router.delete('/:postId', deletePost);

// Likes and comments
router.post('/:postId/like', toggleLike);
router.post('/:postId/comments', addComment);
router.delete('/:postId/comments/:commentId', deleteComment);

module.exports = router;
