const Follow = require('../models/Follow');
const User = require('../models/User');
const { generateResponse } = require('../utils/helpers');

exports.followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }
        
        // Check if already following
        const existingFollow = await Follow.findOne({
            followerId: req.user.id,
            followingId: userId
        });
        
        if (existingFollow) {
            // Already following, so unfollow
            await Follow.deleteOne({
                followerId: req.user.id,
                followingId: userId
            });
            return res.json(generateResponse('success', 'User unfollowed successfully'));
        } else {
            // Not following yet, so follow
            const newFollow = new Follow({
                followerId: req.user.id,
                followingId: userId
            });
            
            await newFollow.save();
            return res.json(generateResponse('success', 'User followed successfully'));
        }
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json(generateResponse('error', 'Error following user'));
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await Follow.deleteOne({
            followerId: req.user.id,
            followingId: userId
        });
        
        if (result.deletedCount > 0) {
            res.json(generateResponse('success', 'User unfollowed successfully'));
        } else {
            res.status(404).json(generateResponse('error', 'Follow relationship not found'));
        }
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json(generateResponse('error', 'Error unfollowing user'));
    }
};

exports.getFollowCounts = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Count followers (people who follow the specified user)
        const followersCount = await Follow.countDocuments({
            followingId: userId
        });
        
        // Count following (people the specified user follows)
        const followingCount = await Follow.countDocuments({
            followerId: userId
        });
        
        // Check if the current user follows this user
        const isFollowing = await Follow.exists({
            followerId: req.user.id,
            followingId: userId
        });
        
        res.json(generateResponse('success', 'Follow counts retrieved', {
            followers: followersCount,
            following: followingCount,
            isFollowing: !!isFollowing
        }));
    } catch (error) {
        console.error('Get follow counts error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving follow counts'));
    }
};
