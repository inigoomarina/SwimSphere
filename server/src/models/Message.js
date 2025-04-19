const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
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

// Index for efficient querying
MessageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });
MessageSchema.index({ recipientId: 1, read: 1 });

module.exports = mongoose.model('Message', MessageSchema);
