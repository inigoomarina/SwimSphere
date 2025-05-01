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
    role: {
        type: String,
        enum: ['swimmer', 'coach', 'admin', ''],
        default: ''
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    birthDate: {
        type: Date
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    swimTeam: {
        type: String,
        default: ''
    },
    favoriteStroke: {
        type: String,
        enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individualMedley', ''],
        default: ''
    },
    favoriteEvent: {
        type: String,
        default: ''
    },
    coachRole: {
        type: String,
        enum: ['head', 'assistant', 'volunteer', 'other', ''],
        default: ''
    },
    onboardingComplete: {
        type: Boolean,
        default: false
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
    profileBanner: {
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
}, {
    timestamps: true
});

// Add the chat references to the user schema
userSchema.add({
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;