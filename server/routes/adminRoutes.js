const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAdminSalesAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all admin routes with protect & authorize('ADMIN')
router.use(protect, authorize('ADMIN'));

// Route: GET /api/admin/dashboard
router.get('/dashboard', getAdminDashboardStats);

// Route: GET /api/admin/sales
router.get('/sales', getAdminSalesAnalytics);

module.exports = router;
