const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAdminSalesAnalytics,
} = require('../controllers/adminController');
const {
  getAllOrdersForAdmin,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all admin routes with protect & authorize('ADMIN')
router.use(protect, authorize('ADMIN'));

// Route: GET /api/admin/dashboard
router.get('/dashboard', getAdminDashboardStats);

// Route: GET /api/admin/sales
router.get('/sales', getAdminSalesAnalytics);

// Route: GET /api/admin/orders (View all orders + student details + UPI transaction IDs)
router.get('/orders', getAllOrdersForAdmin);

// Route: PATCH /api/admin/orders/:id/status (Verify payment / update order status)
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;

