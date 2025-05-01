const Post = require('../models/Post');
const User = require('../models/User');
const Follow = require('../models/Follow');
const { generateResponse } = require('../utils/helpers');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content, mediaUrl, tags, visibility } = req.body;
        
        if (!content && !mediaUrl) {
            return res.status(400).json(generateResponse('error', 'Post must have content or media'));
        }
        
        const newPost = new Post({
            userId: req.user.id,
            content: content || '',
            mediaUrl: mediaUrl || '',
            tags: tags || [],
            visibility: visibility || 'public'
        });
        
        const savedPost = await newPost.save();
        
        // Populate user info for the response
        const populatedPost = await Post.findById(savedPost._id)
            .populate('userId', 'username firstName lastName profileImage')
            .lean();
            
        // Add user-friendly format for the frontend
        const formattedPost = {
            ...populatedPost,
            author: {
                id: populatedPost.userId._id,
                username: populatedPost.userId.username,
                name: `${populatedPost.userId.firstName} ${populatedPost.userId.lastName}`,
                profileImage: populatedPost.userId.profileImage || '/images/default-avatar.png'
            },
            isLiked: false,
            comments: populatedPost.comments || []
        };
        
        delete formattedPost.userId;
        
        res.status(201).json(generateResponse('success', 'Post created successfully', formattedPost));
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json(generateResponse('error', 'Error creating post'));
    }
};

// Get posts for feed (posts from followed users and own posts)
exports.getFeedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        // Get IDs of users that the current user follows
        const follows = await Follow.find({ followerId: req.user.id });
        const followingIds = follows.map(follow => follow.followingId);
        
        // Include the user's own posts in the feed
        const visibleUserIds = [...followingIds, req.user.id];
        
        // Find posts from followed users and own posts that are public or followers-only
        const posts = await Post.find({
            $and: [
                { userId: { $in: visibleUserIds } },
                { $or: [
                    { visibility: 'public' },
                    { visibility: 'followers' },
                    { userId: req.user.id } // User can see all their own posts
                ]}
            ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'username firstName lastName profileImage')
        .lean();
        
        // Format posts for frontend
        const formattedPosts = posts.map(post => ({
            ...post,
            author: {
                id: post.userId._id,
                username: post.userId.username,
                name: `${post.userId.firstName} ${post.userId.lastName}`,
                profileImage: post.userId.profileImage || '/images/default-avatar.png'
            },
            isLiked: post.likes.some(id => id.toString() === req.user.id),
        }));
        
        // Remove userId as we've moved it to author
        formattedPosts.forEach(post => delete post.userId);
        
        // Count total posts for pagination
        const total = await Post.countDocuments({
            $and: [
                { userId: { $in: visibleUserIds } },
                { $or: [
                    { visibility: 'public' },
                    { visibility: 'followers' },
                    { userId: req.user.id }
                ]}
            ]
        });
        
        res.json(generateResponse('success', 'Feed posts retrieved successfully', {
            posts: formattedPosts,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        }));
    } catch (error) {
        console.error('Get feed posts error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving feed posts'));
    }
};

// Get posts by a specific user
exports.getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        // Check if the requested user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }
        
        // Determine which posts to show based on relationship
        let visibilityFilter = {};
        
        if (userId === req.user.id) {
            // Viewing own profile - show all posts
            visibilityFilter = {};
        } else {
            // Check if the current user follows the profile user
            const isFollowing = await Follow.findOne({
                followerId: req.user.id,
                followingId: userId
            });
            
            if (isFollowing) {
                // Show public and followers-only posts
                visibilityFilter = { visibility: { $in: ['public', 'followers'] } };
            } else {
                // Show only public posts
                visibilityFilter = { visibility: 'public' };
            }
        }
        
        // Find posts with appropriate visibility
        const posts = await Post.find({ 
            userId, 
            ...visibilityFilter
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'username firstName lastName profileImage')
        .lean();
        
        // Format posts for frontend
        const formattedPosts = posts.map(post => ({
            ...post,
            author: {
                id: post.userId._id,
                username: post.userId.username,
                name: `${post.userId.firstName} ${post.userId.lastName}`,
                profileImage: post.userId.profileImage || '/images/default-avatar.png'
            },
            isLiked: post.likes.some(id => id.toString() === req.user.id),
        }));
        
        // Remove userId as we've moved it to author
        formattedPosts.forEach(post => delete post.userId);
        
        // Count total posts for pagination
        const total = await Post.countDocuments({ 
            userId,
            ...visibilityFilter
        });
        
        res.json(generateResponse('success', 'User posts retrieved successfully', {
            posts: formattedPosts,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        }));
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving user posts'));
    }
};

// Like or unlike a post
exports.toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json(generateResponse('error', 'Post not found'));
        }
        
        // Check if user has already liked the post
        const index = post.likes.indexOf(req.user.id);
        let message;
        
        if (index === -1) {
            // User hasn't liked the post, so add the like
            post.likes.push(req.user.id);
            message = 'Post liked successfully';
        } else {
            // User has already liked the post, so remove the like
            post.likes.splice(index, 1);
            message = 'Post unliked successfully';
        }
        
        await post.save();
        
        res.json(generateResponse('success', message, {
            postId,
            likesCount: post.likes.length,
            isLiked: index === -1 // true if just liked, false if just unliked
        }));
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json(generateResponse('error', 'Error toggling like'));
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json(generateResponse('error', 'Comment content is required'));
        }
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json(generateResponse('error', 'Post not found'));
        }
        
        // Create a new comment
        const newComment = {
            userId: req.user.id,
            content,
            createdAt: new Date()
        };
        
        // Add the comment to the post
        post.comments.push(newComment);
        await post.save();
        
        // Get user info for the comment
        const user = await User.findById(req.user.id);
        
        // Format the comment for the response
        const formattedComment = {
            _id: post.comments[post.comments.length - 1]._id,
            content,
            createdAt: new Date(),
            author: {
                _id: user._id,
                id: user._id,
                username: user.username,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage || '/images/default-avatar.png'
            }
        };
        
        res.status(201).json(generateResponse('success', 'Comment added successfully', formattedComment));
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json(generateResponse('error', 'Error adding comment'));
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json(generateResponse('error', 'Post not found'));
        }
        
        // Find the comment
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json(generateResponse('error', 'Comment not found'));
        }
        
        // Check if the user is authorized to delete the comment
        if (comment.userId.toString() !== req.user.id && post.userId.toString() !== req.user.id) {
            return res.status(403).json(generateResponse('error', 'Not authorized to delete this comment'));
        }
        
        // Remove the comment
        comment.remove();
        await post.save();
        
        res.json(generateResponse('success', 'Comment deleted successfully'));
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json(generateResponse('error', 'Error deleting comment'));
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json(generateResponse('error', 'Post not found'));
        }
        
        // Check if the user is the post author
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json(generateResponse('error', 'Not authorized to delete this post'));
        }
        
        await post.remove();
        
        res.json(generateResponse('success', 'Post deleted successfully'));
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json(generateResponse('error', 'Error deleting post'));
    }
};