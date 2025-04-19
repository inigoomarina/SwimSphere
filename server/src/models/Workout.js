const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkoutSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    coachId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    distance: {
        type: Number, // in meters
        required: true
    },
    focusArea: {
        type: String,
        enum: ['endurance', 'speed', 'technique', 'recovery', 'mixed'],
        default: 'mixed'
    },
    exercises: [{
        name: String,
        reps: Number,
        distance: Number,
        notes: String
    }],
    mediaUrl: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
