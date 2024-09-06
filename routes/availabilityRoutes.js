const express = require('express');
const Availability = require('../models/Availability');
const router = express.Router();

router.post('/', async (req, res) => {
  const { user, start, end, duration } = req.body;
  try {
    const newAvailability = new Availability({ user, start, end, duration });
    await newAvailability.save();
    res.status(201).json(newAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const availabilities = await Availability.find({ user: req.params.userId });
    res.status(200).json(availabilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { start, end, duration } = req.body;
  try {
    const updatedAvailability = await Availability.findByIdAndUpdate(req.params.id, { start, end, duration }, { new: true });
    res.status(200).json(updatedAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
