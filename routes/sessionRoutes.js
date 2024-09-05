const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Availability = require('../models/Availability');

// Schedule a new session
router.post('/', async (req, res) => {
    const { start, end, attendees } = req.body;

    try {
        const conflicts = await Promise.all(attendees.map(async (attendee) => {
            const availability = await Availability.findOne({
                user: attendee,
                start: { $lte: start },
                end: { $gte: end }
            });
            return availability ? null : attendee;
        }));

        const unavailableAttendees = conflicts.filter(a => a !== null);
        if (unavailableAttendees.length > 0) {
            return res.status(409).json({
                message: "Scheduling conflict",
                unavailableAttendees
            });
        }

        const newSession = new Session({ start, end, attendees });
        await newSession.save();
        res.status(201).send('Session scheduled successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Fetch all sessions
router.get('/', async (req, res) => {
    try {
        const sessions = await Session.find({});
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;