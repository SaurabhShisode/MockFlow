const mongoose = require('mongoose');

const mockSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    trim: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    uppercase: true
  },
  status: {
    type: Number,
    required: true,
    default: 200
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  delay: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 0
  }
});

// Compound index to ensure unique path + method combinations
mockSchema.index({ path: 1, method: 1 }, { unique: true });

module.exports = mongoose.model('Mock', mockSchema); 