const express = require('express');
const Session = require('../models/Session');
const Availability = require('../models/Availability');
const router = express.Router();

// Schedule a new session
router.post('/', async (req, res) => {
    const { start, end, attendees } = req.body;
    try {
        // Ensure all attendees are available
        const conflicts = await Promise.all(
            attendees.map(async attendee => {
                const availability = await Availability.findOne({
                    user: attendee,
                    start: { $lte: start },
                    end: { $gte: end }
                });
                return availability ? null : attendee;
            })
        );

        const unavailableAttendees = conflicts.filter(a => a);
        if (unavailableAttendees.length > 0) {
            return res.status(409).json({ message: "Scheduling conflict", unavailableAttendees });
        }

        const newSession = new Session({ start, end, attendees });
        await newSession.save();
        res.status(201).json(newSession);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all sessions
router.get('/', async (req, res) => {
    try {
        const sessions = await Session.find({}).populate('attendees', 'email');
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
