const mongoose = require('mongoose');

const dynamicDataSchema = new mongoose.Schema({
  mockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mock',
    required: true
  },
  path: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
dynamicDataSchema.index({ mockId: 1 });
dynamicDataSchema.index({ path: 1 });

module.exports = mongoose.model('DynamicData', dynamicDataSchema); 