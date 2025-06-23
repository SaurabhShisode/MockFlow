const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
  mockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mock',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  method: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  headers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  queryParams: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  responseBody: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  statusCode: {
    type: Number,
    required: true
  },
  clientIP: {
    type: String,
    default: null
  },
  responseTime: {
    type: Number,
    default: 0
  }
});

requestLogSchema.index({ mockId: 1, timestamp: -1 });

module.exports = mongoose.model('RequestLog', requestLogSchema); 