const mongoose = require('mongoose');

const dynamicDataSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    unique: true
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
dynamicDataSchema.index({ path: 1 });

module.exports = mongoose.model('DynamicData', dynamicDataSchema); 

