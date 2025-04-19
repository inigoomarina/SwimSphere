const Workout = require('../models/Workout');
const Challenge = require('../models/Challenge');
const { generateResponse } = require('../utils/helpers');

// Workout Controllers
exports.createWorkout = async (req, res) => {
    try {
        const { 
            title, description, difficulty, duration, 
            distance, focusArea, exercises, mediaUrl 
        } = req.body;

        // Validate required fields
        if (!title || !description || !duration || !distance) {
            return res.status(400).json(generateResponse('error', 'Missing required fields'));
        }

        const newWorkout = new Workout({
            title,
            description,
            coachId: req.user.id,
            difficulty: difficulty || 'intermediate',
            duration,
            distance,
            focusArea: focusArea || 'mixed',
            exercises: exercises || [],
            mediaUrl: mediaUrl || ''
        });

        const savedWorkout = await newWorkout.save();
        
        res.status(201).json(generateResponse('success', 'Workout created successfully', savedWorkout));
    } catch (error) {
        console.error('Create workout error:', error);
        res.status(500).json(generateResponse('error', 'Error creating workout'));
    }
};

exports.getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({ coachId: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json(generateResponse('success', 'Workouts retrieved successfully', workouts));
    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving workouts'));
    }
};

exports.getWorkoutById = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        
        if (!workout) {
            return res.status(404).json(generateResponse('error', 'Workout not found'));
        }
        
        // Check if the workout belongs to this coach
        if (workout.coachId.toString() !== req.user.id) {
            return res.status(403).json(generateResponse('error', 'Unauthorized access to this workout'));
        }
        
        res.json(generateResponse('success', 'Workout retrieved successfully', workout));
    } catch (error) {
        console.error('Get workout by ID error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving workout'));
    }
};

exports.updateWorkout = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        
        if (!workout) {
            return res.status(404).json(generateResponse('error', 'Workout not found'));
        }
        
        // Check if the workout belongs to this coach
        if (workout.coachId.toString() !== req.user.id) {
            return res.status(403).json(generateResponse('error', 'Unauthorized access to this workout'));
        }
        
        // Update fields
        const updateData = req.body;
        Object.keys(updateData).forEach(key => {
            if (key !== '_id' && key !== 'coachId' && key !== 'createdAt') {
                workout[key] = updateData[key];
            }
        });
        
        const updatedWorkout = await workout.save();
        
        res.json(generateResponse('success', 'Workout updated successfully', updatedWorkout));
    } catch (error) {
        console.error('Update workout error:', error);
        res.status(500).json(generateResponse('error', 'Error updating workout'));
    }
};

exports.deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        
        if (!workout) {
            return res.status(404).json(generateResponse('error', 'Workout not found'));
        }
        
        // Check if the workout belongs to this coach
        if (workout.coachId.toString() !== req.user.id) {
            return res.status(403).json(generateResponse('error', 'Unauthorized access to this workout'));
        }
        
        await workout.remove();
        
        res.json(generateResponse('success', 'Workout deleted successfully'));
    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json(generateResponse('error', 'Error deleting workout'));
    }
};

// Challenge Controllers
exports.createChallenge = async (req, res) => {
    try {
        const { 
            title, description, startDate, endDate, 
            targetDistance, targetTime, stroke, mediaUrl 
        } = req.body;

        // Validate required fields
        if (!title || !description || !startDate || !endDate || !targetDistance) {
            return res.status(400).json(generateResponse('error', 'Missing required fields'));
        }

        const newChallenge = new Challenge({
            title,
            description,
            coachId: req.user.id,
            startDate,
            endDate,
            targetDistance,
            targetTime: targetTime || null,
            stroke: stroke || 'any',
            mediaUrl: mediaUrl || ''
        });

        const savedChallenge = await newChallenge.save();
        
        res.status(201).json(generateResponse('success', 'Challenge created successfully', savedChallenge));
    } catch (error) {
        console.error('Create challenge error:', error);
        res.status(500).json(generateResponse('error', 'Error creating challenge'));
    }
};

exports.getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find({ coachId: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json(generateResponse('success', 'Challenges retrieved successfully', challenges));
    } catch (error) {
        console.error('Get challenges error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving challenges'));
    }
};

exports.getChallengeById = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate('participants.userId', 'username firstName lastName profileImage');
        
        if (!challenge) {
            return res.status(404).json(generateResponse('error', 'Challenge not found'));
        }
        
        // Check if the challenge belongs to this coach
        if (challenge.coachId.toString() !== req.user.id) {
            return res.status(403).json(generateResponse('error', 'Unauthorized access to this challenge'));
        }
        
        res.json(generateResponse('success', 'Challenge retrieved successfully', challenge));
    } catch (error) {
        console.error('Get challenge by ID error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving challenge'));
    }
};

exports.updateChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        
        if (!challenge) {
            return res.status(404).json(generateResponse('error', 'Challenge not found'));
        }
        
        // Check if the challenge belongs to this coach
        if (challenge.coachId.toString() !== req.user.id) {
            return res.status(403).json(generateResponse('error', 'Unauthorized access to this challenge'));
        }
        
        // Update fields
        const updateData = req.body;
        Object.keys(updateData).forEach(key => {
            if (key !== '_id' && key !== 'coachId' && key !== 'createdAt' && key !== 'participants') {
                challenge[key] = updateData[key];
            }
        });
        
        const updatedChallenge = await challenge.save();
        
        res.json(generateResponse('success', 'Challenge updated successfully', updatedChallenge));
    } catch (error) {
        console.error('Update challenge error:', error);
        res.status(500).json(generateResponse('error', 'Error updating challenge'));
    }
};

exports.deleteChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        
        if (!challenge) {
            return res.status(404).json(generateResponse('error', 'Challenge not found'));
        }
        
        // Check if the challenge belongs to this coach
        if (challenge.coachId.toString() !== req.user.id) {
            return res.status(403).json(generateResponse('error', 'Unauthorized access to this challenge'));
        }
        
        await challenge.remove();
        
        res.json(generateResponse('success', 'Challenge deleted successfully'));
    } catch (error) {
        console.error('Delete challenge error:', error);
        res.status(500).json(generateResponse('error', 'Error deleting challenge'));
    }
};
