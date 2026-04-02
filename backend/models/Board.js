const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  position: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  tasks: [taskSchema]
}, { timestamps: true });

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Task Board'
  },
  type: {
    type: String,
    enum: ['solo', 'collaborative'],
    default: 'solo'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sharePassword: {
    type: String,
    default: null
  },
  lists: [listSchema]
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);
