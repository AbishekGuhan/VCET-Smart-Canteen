const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

// Import Mongoose Models
require('./models/User');
require('./models/Category');
require('./models/FoodItem');
require('./models/Order');
require('./models/Inventory');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);

// API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'VCET Smart Canteen API is running' });
});

// Database Connection Test Endpoint
app.get('/api/db-test', (req, res) => {
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };
  const dbStateCode = mongoose.connection.readyState;
  res.status(200).json({
    status: 'success',
    databaseState: states[dbStateCode] || 'Unknown',
    readyStateCode: dbStateCode,
    modelsLoaded: Object.keys(mongoose.models),
    timestamp: new Date().toISOString()
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[VCET Smart Canteen] Server running on port ${PORT}`);
  });
}

module.exports = app;
