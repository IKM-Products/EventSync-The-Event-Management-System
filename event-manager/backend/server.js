const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Datastore = require('@seald-io/nedb'); // Updated to use standard nedb
const path = require('path');

dotenv.config();
const app = express();

// Enabled specific CORS headers with credentials allowed to match your Vite port
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Create an automated local database file right inside your backend folder
const db = new Datastore({ filename: path.join(__dirname, 'local_database.db'), autoload: true });
global.db = db; // Makes the database instance accessible across your route files

// Attach routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Stand up the server instantly without network handshakes
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Mock MongoDB Connected Successfully (Local Fallback Enacted)!');
  console.log(`Backend server running on port ${PORT}`);
});