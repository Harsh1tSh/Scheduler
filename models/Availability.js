const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // duration in minutes
    required: true
  }
});

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;