const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
module.exports = mongoose.model('Session', sessionSchema);
