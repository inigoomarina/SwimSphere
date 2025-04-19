const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const { generateResponse } = require('../utils/helpers');

// Get leaderboard entries with filters
exports.getLeaderboard = async (req, res) => {
    try {
        const { stroke, distance, limit = 10 } = req.query;
        
        // Build filter object based on query parameters
        const filter = {};
        if (stroke) filter.stroke = stroke;
        if (distance) filter.distance = parseInt(distance);
        
        // Find entries with filters, sort by time (ascending)
        const leaderboardEntries = await Leaderboard.find(filter)
            .sort({ time: 1 })
            .limit(parseInt(limit))
            .populate('userId', 'username firstName lastName profileImage')
            .lean();
        
        // Group entries by stroke and distance
        const groupedEntries = leaderboardEntries.reduce((acc, entry) => {
            const key = `${entry.stroke}-${entry.distance}`;
            
            if (!acc[key]) {
                acc[key] = {
                    stroke: entry.stroke,
                    distance: entry.distance,
                    entries: []
                };
            }
            
            acc[key].entries.push(entry);
            return acc;
        }, {});
        
        // Get unique values for filter dropdowns
        const uniqueStrokes = await Leaderboard.distinct('stroke');
        const uniqueDistances = await Leaderboard.distinct('distance');
        
        res.json(generateResponse('success', 'Leaderboard data retrieved successfully', {
            leaderboard: Object.values(groupedEntries),
            filters: {
                strokes: uniqueStrokes,
                distances: uniqueDistances
            }
        }));
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving leaderboard data'));
    }
};

// Submit a new time for leaderboard (automatic when users add swim times)
exports.submitTime = async (req, res) => {
    try {
        const { stroke, distance, time, location, competition } = req.body;
        
        // Validate required fields
        if (!stroke || !distance || !time) {
            return res.status(400).json(generateResponse('error', 'Missing required fields'));
        }
        
        // Check if this is a personal best
        const existingBest = await Leaderboard.findOne({
            userId: req.user.id,
            stroke,
            distance: parseInt(distance)
        }).sort({ time: 1 });
        
        // Only add to leaderboard if it's a new personal best
        if (!existingBest || time < existingBest.time) {
            // If there's an existing entry, update it
            if (existingBest) {
                existingBest.time = time;
                existingBest.date = Date.now();
                existingBest.location = location || '';
                existingBest.competition = competition || '';
                
                await existingBest.save();
                
                res.json(generateResponse('success', 'Personal best updated on leaderboard!', existingBest));
            } else {
                // Create a new entry
                const newLeaderboardEntry = new Leaderboard({
                    userId: req.user.id,
                    stroke,
                    distance: parseInt(distance),
                    time,
                    location: location || '',
                    competition: competition || ''
                });
                
                await newLeaderboardEntry.save();
                
                res.status(201).json(generateResponse('success', 'New personal best added to leaderboard!', newLeaderboardEntry));
            }
        } else {
            res.json(generateResponse('info', 'Time submitted but not a personal best'));
        }
    } catch (error) {
        console.error('Submit leaderboard time error:', error);
        res.status(500).json(generateResponse('error', 'Error submitting time to leaderboard'));
    }
};

// Get user's personal bests
exports.getUserBests = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }
        
        // Get all personal bests for this user
        const personalBests = await Leaderboard.find({ userId })
            .sort({ stroke: 1, distance: 1 });
            
        res.json(generateResponse('success', 'Personal bests retrieved successfully', personalBests));
    } catch (error) {
        console.error('Get user bests error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving user personal bests'));
    }
};

// Delete a leaderboard entry (admin only)
exports.deleteEntry = async (req, res) => {
    try {
        const { id } = req.params;
        
        const entry = await Leaderboard.findById(id);
        if (!entry) {
            return res.status(404).json(generateResponse('error', 'Leaderboard entry not found'));
        }
        
        await entry.remove();
        
        res.json(generateResponse('success', 'Leaderboard entry deleted successfully'));
    } catch (error) {
        console.error('Delete leaderboard entry error:', error);
        res.status(500).json(generateResponse('error', 'Error deleting leaderboard entry'));
    }
};
