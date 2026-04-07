const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json());

mongoose.set('bufferCommands', false);

// Cache DB connection across serverless invocations
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
    });
    isConnected = true;
    // Drop stale index if exists
    try {
      const BanquetBooking = require('./model.planLimit/PlanLimit/banquetBooking');
      await BanquetBooking.collection.dropIndex('grcNo_1');
    } catch (e) {}
  } catch (err) {
    isConnected = false;
    throw err;
  }
};

// Connect DB before every request on Vercel
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// Import routes
const planLimitRoutes = require('./Route/planLimitRoutes/planLimitRoutes');
const banquetBookingRoutes = require('./Route/planLimitRoutes/banquetBookingRoutes');
const banquetCategoryRoutes = require('./Route/planLimitRoutes/banquetCategoryRoutes');
const banquetMenuRoutes = require('./Route/planLimitRoutes/banquetMenuRoutes');
const menuItemRoutes = require('./Route/planLimitRoutes/menuItemRoutes');

app.get('/', (req, res) => res.json({ message: 'Buddha Banquet Backend API' }));
app.get('/api/test', (req, res) => res.json({ message: 'API is working', timestamp: new Date() }));

app.use('/api/plan-limits', planLimitRoutes);
app.use('/api/bookings', banquetBookingRoutes);
app.use('/api/categories', banquetCategoryRoutes);
app.use('/api/menus', banquetMenuRoutes);
app.use('/api/menu-items', menuItemRoutes);

// Local development
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
}

module.exports = app;
