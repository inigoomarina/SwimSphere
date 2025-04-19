const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecordSchema = new Schema({
    stroke: {
        type: String,
        required: true,
        enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individualMedley']
    },
    distance: {
        type: Number,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    time: {
        type: Number, // Time in seconds
        required: true
    },
    swimmer: {
        type: String,
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
    ageGroup: {
        type: String,
        default: 'Open'
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'mixed', 'other'],
        required: true
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
RecordSchema.virtual('formattedTime').get(function() {
    const minutes = Math.floor(this.time / 60);
    const seconds = (this.time % 60).toFixed(2);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
});

// Setting toJSON and toObject options to include virtuals
RecordSchema.set('toJSON', { virtuals: true });
RecordSchema.set('toObject', { virtuals: true });

// Index for efficient querying
RecordSchema.index({ stroke: 1, distance: 1, region: 1 });

module.exports = mongoose.model('Record', RecordSchema);
