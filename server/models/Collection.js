const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#6366f1'
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

collectionSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Collection', collectionSchema);
