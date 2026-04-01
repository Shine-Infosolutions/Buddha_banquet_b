const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:4000",
    "http://localhost:5173",
    
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Disable mongoose buffering
mongoose.set('bufferCommands', false);

// Database connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Import routes
const planLimitRoutes = require('./Route/planLimitRoutes/planLimitRoutes');
const banquetBookingRoutes = require('./Route/planLimitRoutes/banquetBookingRoutes');
const banquetCategoryRoutes = require('./Route/planLimitRoutes/banquetCategoryRoutes');
const banquetMenuRoutes = require('./Route/planLimitRoutes/banquetMenuRoutes');
const menuItemRoutes = require('./Route/planLimitRoutes/menuItemRoutes');

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Buddha Banquet Backend API' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date() });
});

app.use('/api/plan-limits', planLimitRoutes);
app.use('/api/bookings', banquetBookingRoutes);
app.use('/api/categories', banquetCategoryRoutes);
app.use('/api/menus', banquetMenuRoutes);
app.use('/api/menu-items', menuItemRoutes);

// Start server after DB connection
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();