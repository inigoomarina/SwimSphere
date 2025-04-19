const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeaderboardSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    verified: {
        type: Boolean,
        default: false
    },
    competition: {
        type: String,
        default: ''
    }
});

// Virtual field for formatted time (mm:ss.ms)
LeaderboardSchema.virtual('formattedTime').get(function() {
    const minutes = Math.floor(this.time / 60);
    const seconds = (this.time % 60).toFixed(2);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
});

// Virtual for user details
LeaderboardSchema.virtual('userDetails', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Setting toJSON and toObject options to include virtuals
LeaderboardSchema.set('toJSON', { virtuals: true });
LeaderboardSchema.set('toObject', { virtuals: true });

// Index for efficient querying
LeaderboardSchema.index({ stroke: 1, distance: 1, time: 1 });

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
