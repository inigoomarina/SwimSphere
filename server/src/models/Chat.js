const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

const ChatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [MessageSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update lastUpdated timestamp before saving
ChatSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});

// Indexes for efficient querying
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('Chat', ChatSchema);
