const express = require('express');
const router = express.Router();

// Helper wrapper functions to make NeDB work seamlessly with async/await
const dbFind = (query) => new Promise((resolve, reject) => {
  global.db.find(query, (err, docs) => err ? reject(err) : resolve(docs));
});

const dbFindOne = (query) => new Promise((resolve, reject) => {
  global.db.findOne(query, (err, doc) => err ? reject(err) : resolve(doc));
});

const dbInsert = (doc) => new Promise((resolve, reject) => {
  global.db.insert(doc, (err, newDoc) => err ? reject(err) : resolve(newDoc));
});

const dbUpdate = (query, update, options) => new Promise((resolve, reject) => {
  global.db.update(query, update, options, (err, numReplaced) => err ? reject(err) : resolve(numReplaced));
});

const dbRemove = (query, options) => new Promise((resolve, reject) => {
  global.db.remove(query, options, (err, numRemoved) => err ? reject(err) : resolve(numRemoved));
});


// 1. GET ALL EVENTS (User and Admin)
router.get('/', async (req, res) => {
  try {
    const events = await dbFind({ type: 'event' });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. CREATE EVENT (Admin Only)
router.post('/', async (req, res) => {
  try {
    const { title, description, date, time, location, category, price, capacity, imageUrl } = req.body;
    
    if (!title || !date || !location || !category) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }

    const newEvent = {
      type: 'event',
      title,
      description: description || '',
      date,
      time: time || '12:00',
      location,
      category,
      price: Number(price) || 0,
      capacity: Number(capacity) || 100,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date()
    };

    const savedEvent = await dbInsert(newEvent);
    res.status(201).json({ success: true, event: savedEvent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. UPDATE EVENT (Admin Only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location, category, price, capacity, imageUrl } = req.body;

    const numReplaced = await dbUpdate(
      { type: 'event', _id: id },
      { 
        $set: { 
          title, 
          description, 
          date, 
          time, 
          location, 
          category, 
          price: Number(price) || 0, 
          capacity: Number(capacity) || 100,
          imageUrl
        } 
      },
      {}
    );

    if (numReplaced === 0) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.json({ success: true, message: "Event updated successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. DELETE EVENT (Admin Only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numRemoved = await dbRemove({ type: 'event', _id: id }, {});

    if (numRemoved === 0) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    // Also cascade delete any bookings related to this event
    await dbRemove({ type: 'booking', eventId: id }, { multi: true });

    res.json({ success: true, message: "Event deleted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// 5. GET DASHBOARD STATISTICS (Admin Only)
router.get('/stats', async (req, res) => {
  try {
    const events = await dbFind({ type: 'event' });
    const bookings = await dbFind({ type: 'booking' });
    const users = await dbFind({ type: 'user' });

    // Calculate total revenue from bookings assuming we calculate matching event prices
    let totalRevenue = 0;
    bookings.forEach(b => {
      const match = events.find(e => e._id === b.eventId);
      if (match) {
        totalRevenue += (match.price || 0);
      }
    });

    res.json({
      success: true,
      stats: {
        totalEvents: events.length,
        totalBookings: bookings.length,
        totalUsers: users.length,
        totalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. BOOK AN EVENT (User Only)
router.post('/book', async (req, res) => {
  try {
    const { eventId, userEmail } = req.body;

    if (!eventId || !userEmail) {
      return res.status(400).json({ success: false, message: "Missing eventId or userEmail." });
    }

    // Check if user already booked this event
    const existingBooking = await dbFindOne({ type: 'booking', eventId, userEmail });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: "You have already registered for this event." });
    }

    const newBooking = {
      type: 'booking',
      eventId,
      userEmail,
      bookedAt: new Date()
    };

    const savedBooking = await dbInsert(newBooking);
    res.status(201).json({ success: true, booking: savedBooking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GET BOOKINGS FOR A SPECIFIC USER (User Only)
router.get('/bookings/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const bookings = await dbFind({ type: 'booking', userEmail: email });
    const events = await dbFind({ type: 'event' });

    // Populate event details onto the bookings array
    const populatedBookings = bookings.map(b => {
      const eventDetails = events.find(e => e._id === b.eventId);
      return {
        ...b,
        event: eventDetails || { title: "Deleted Event", location: "Unknown", price: 0 }
      };
    });

    res.json({ success: true, bookings: populatedBookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// 8. SUBMIT SYSTEM FEEDBACK (User Only)
router.post('/feedback', async (req, res) => {
  try {
    const { rating, comment, category, userEmail, userName } = req.body;
    
    if (!rating || !userEmail) {
      return res.status(400).json({ success: false, message: "Rating and email details are required." });
    }

    const newFeedback = {
      type: 'feedback',
      rating: Number(rating),
      comment: comment || '',
      category: category || 'General',
      userEmail,
      userName: userName || userEmail.split('@')[0],
      createdAt: new Date()
    };

    const savedFeedback = await dbInsert(newFeedback);
    res.status(201).json({ success: true, feedback: savedFeedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. GET ALL SYSTEM FEEDBACKS (Admin and User)
router.get('/feedback', async (req, res) => {
  try {
    const feedbacks = await dbFind({ type: 'feedback' });
    // Sort feedbacks latest first
    feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. DELETE SYSTEM FEEDBACK (Admin Only)
router.delete('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numRemoved = await dbRemove({ type: 'feedback', _id: id }, {});
    
    if (numRemoved === 0) {
      return res.status(404).json({ success: false, message: "Feedback record not found." });
    }
    res.json({ success: true, message: "Feedback removed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;