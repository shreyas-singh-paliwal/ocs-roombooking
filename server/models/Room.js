const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  block: { type: String, required: true },
  roomName: { type: String, required: true },
  capacity: { type: Number, required: true },
  allowedPurposes: [{ 
    type: String, 
    enum: ['OA', 'Interview', 'PPT'] 
  }],
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);