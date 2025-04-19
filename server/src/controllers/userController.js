const User = require('../models/User');
const { generateResponse } = require('../utils/helpers');

// Fetch user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }
        res.json(generateResponse('success', 'Profile retrieved successfully', user));
    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json(generateResponse('error', 'Server error'));
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    const { 
        username, email, firstName, lastName, bio, 
        birthDate, swimTeam, role, profileImage, profileBanner,
        favoriteStroke, favoriteEvent 
    } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }

        // Update basic fields if provided
        if (username) user.username = username;
        if (email) user.email = email;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (bio !== undefined) user.bio = bio;
        if (birthDate) user.birthDate = birthDate;
        if (swimTeam !== undefined) user.swimTeam = swimTeam;
        if (role && ['swimmer', 'coach'].includes(role)) user.role = role;
        
        // Update image fields if provided
        if (profileImage) user.profileImage = profileImage;
        if (profileBanner) user.profileBanner = profileBanner;
        
        // Update preferences if provided
        if (favoriteStroke !== undefined) user.favoriteStroke = favoriteStroke;
        if (favoriteEvent !== undefined) user.favoriteEvent = favoriteEvent;

        user.updatedAt = Date.now();
        const updatedUser = await user.save();
        
        res.json(generateResponse('success', 'Profile updated successfully', 
            updatedUser.toObject({ getters: true, virtuals: true, transform: (doc, ret) => {
                delete ret.password;
                return ret;
            }})));
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json(generateResponse('error', 'Error updating profile'));
    }
};

// Add a new swim time record
exports.addSwimTime = async (req, res) => {
    const { stroke, distance, time, date, location, notes } = req.body;
    
    try {
        // Validate input
        if (!stroke || !distance || !time) {
            return res.status(400).json(generateResponse('error', 'Stroke, distance, and time are required'));
        }
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }
        
        const newSwimTime = {
            stroke,
            distance,
            time,
            date: date || Date.now(),
            location: location || '',
            notes: notes || ''
        };
        
        user.swimTimes.push(newSwimTime);
        await user.save();
        
        // Check if this is a personal best and update leaderboard
        try {
            // Import here to avoid circular dependency
            const Leaderboard = require('../models/Leaderboard');
            
            const existingBest = await Leaderboard.findOne({
                userId: user._id,
                stroke,
                distance: parseInt(distance)
            }).sort({ time: 1 });
            
            // Only add to leaderboard if it's a new personal best
            if (!existingBest || time < existingBest.time) {
                // If there's an existing entry, update it
                if (existingBest) {
                    existingBest.time = time;
                    existingBest.date = date || Date.now();
                    existingBest.location = location || '';
                    
                    await existingBest.save();
                    
                    console.log('Updated leaderboard entry');
                } else {
                    // Create a new entry
                    const newLeaderboardEntry = new Leaderboard({
                        userId: user._id,
                        stroke,
                        distance: parseInt(distance),
                        time,
                        date: date || Date.now(),
                        location: location || ''
                    });
                    
                    await newLeaderboardEntry.save();
                    
                    console.log('Created new leaderboard entry');
                }
            }
        } catch (leaderboardError) {
            // Only log the error, don't fail the main request
            console.error('Error updating leaderboard:', leaderboardError);
        }
        
        res.status(201).json(generateResponse('success', 'Swim time added successfully', 
            user.swimTimes[user.swimTimes.length - 1]));
    } catch (error) {
        console.error('Add swim time error:', error);
        res.status(500).json(generateResponse('error', 'Error adding swim time'));
    }
};

// Get all swim times for a user
exports.getSwimTimes = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('swimTimes');
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }
        
        res.json(generateResponse('success', 'Swim times retrieved successfully', user.swimTimes));
    } catch (error) {
        console.error('Get swim times error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving swim times'));
    }
};

// Delete a swim time record
exports.deleteSwimTime = async (req, res) => {
    const { timeId } = req.params;
    
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }
        
        const timeIndex = user.swimTimes.findIndex(time => time._id.toString() === timeId);
        
        if (timeIndex === -1) {
            return res.status(404).json(generateResponse('error', 'Swim time not found'));
        }
        
        user.swimTimes.splice(timeIndex, 1);
        await user.save();
        
        res.json(generateResponse('success', 'Swim time deleted successfully'));
    } catch (error) {
        console.error('Delete swim time error:', error);
        res.status(500).json(generateResponse('error', 'Error deleting swim time'));
    }
};

// Add an achievement
exports.addAchievement = async (req, res) => {
    const { title, date, description } = req.body;
    
    try {
        if (!title) {
            return res.status(400).json(generateResponse('error', 'Achievement title is required'));
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }
        
        const newAchievement = {
            title,
            date: date || Date.now(),
            description: description || ''
        };
        
        user.achievements.push(newAchievement);
        await user.save();
        
        res.status(201).json(generateResponse('success', 'Achievement added successfully', newAchievement));
    } catch (error) {
        console.error('Add achievement error:', error);
        res.status(500).json(generateResponse('error', 'Error adding achievement'));
    }
};

// Search users by name or username
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.length < 2) {
            return res.json(generateResponse('success', 'Search results', []));
        }
        
        // Import Follow model
        const Follow = require('../models/Follow');
        
        // Create a case-insensitive regex for partial matching
        const searchRegex = new RegExp(query, 'i');
        
        // Improved search query with better field matching
        const users = await User.find({
            $or: [
                { username: { $regex: searchRegex } },
                { firstName: { $regex: searchRegex } },
                { lastName: { $regex: searchRegex } },
                { swimTeam: { $regex: searchRegex } },
                // Also search for full name matches
                {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ["$firstName", " ", "$lastName"] },
                            regex: searchRegex,
                            options: "i"
                        }
                    }
                }
            ],
            _id: { $ne: req.user.id } // Exclude the current user
        })
        .select('username firstName lastName profileImage swimTeam city country')
        .limit(20)
        .lean();
        
        // Check if current user follows each result
        const enrichedUsers = await Promise.all(users.map(async (user) => {
            const isFollowing = await Follow.findOne({
                followerId: req.user.id, 
                followingId: user._id
            });
            
            return {
                ...user,
                id: user._id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
                displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                username: user.username,
                formattedUsername: `@${user.username}`,
                location: user.city && user.country ? `${user.city}, ${user.country}` : (user.city || user.country || ''),
                isFollowing: !!isFollowing
            };
        }));
        
        res.json(generateResponse('success', 'Search results retrieved', enrichedUsers));
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json(generateResponse('error', 'Error searching users'));
    }
};