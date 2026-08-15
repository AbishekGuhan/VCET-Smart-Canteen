const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order routes require authentication — uses the existing protect middleware
router.post('/', protect, createOrder);       // POST /api/orders   — place a new order
router.get('/', protect, getUserOrders);      // GET  /api/orders   — get user's orders
router.get('/:id', protect, getOrderById);    // GET  /api/orders/:id — get a single order

module.exports = router;
