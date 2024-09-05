const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');

// Add availability
router.post('/', async (req, res) => {
    try {
        const { user, start, end, duration } = req.body;
        const newAvailability = new Availability({ user, start, end, duration });
        const savedAvailability = await newAvailability.save();
        res.status(201).json(savedAvailability);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get availability for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const userAvailabilities = await Availability.find({ user: req.params.userId });
        res.status(200).json(userAvailabilities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update availability
router.patch('/:availabilityId', async (req, res) => {
    try {
        const { start, end, duration } = req.body;
        const updatedAvailability = await Availability.findByIdAndUpdate(
            req.params.availabilityId,
            { start, end, duration },
            { new: true }
        );
        if (!updatedAvailability) {
            return res.status(404).json({ message: 'Availability not found' });
        }
        res.status(200).json(updatedAvailability);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete availability
router.delete('/:availabilityId', async (req, res) => {
    try {
        const deletedAvailability = await Availability.findByIdAndDelete(req.params.availabilityId);
        if (!deletedAvailability) {
            return res.status(404).json({ message: 'Availability not found' });
        }
        res.status(200).json({ message: 'Availability deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;