const mongoose = require('mongoose');

// Define the schema for swim times
const swimTimeSchema = new mongoose.Schema({
    stroke: {
        type: String,
        required: true,
        enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individualMedley']
    },
    distance: {
        type: Number,
        required: true
    },
    time: {
        type: Number, // Time in seconds
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    // New fields for swimmer profiles
    role: {
        type: String,
        enum: ['swimmer', 'coach', 'admin'],
        default: 'swimmer'
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        default: ''
    },
    birthDate: {
        type: Date
    },
    swimTeam: {
        type: String,
        default: ''
    },
    achievements: [{
        title: String,
        date: Date,
        description: String
    }],
    swimTimes: [swimTimeSchema],
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: ''
    },
    profileBanner: {  // Add this field
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;