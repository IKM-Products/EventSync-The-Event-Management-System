const Event = require('../models/Event');
const mongoose = require('mongoose');

exports.createEvent = async (req, res) => {
  try {
    const event = new Event({ ...req.body, organizer: req.user.id });
    await event.save();
    res.status(201).json(event);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) query.$text = { $search: search };
    if (category) query.category = category;

    const events = await Event.find(query).populate('organizer', 'name email').sort({ date: 1 });
    res.json(events);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user.id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ msg: 'Event not found or unauthorized' });
    res.json(event);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user.id });
    if (!event) return res.status(404).json({ msg: 'Event not found or unauthorized' });
    res.json({ msg: 'Event deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ organizer: req.user.id });
    const categoryStats = await Event.aggregate([
      { $match: { organizer: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ totalEvents, categoryStats });
  } catch (err) { res.status(500).json({ error: err.message }); }
};