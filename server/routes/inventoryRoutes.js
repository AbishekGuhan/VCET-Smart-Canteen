const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All inventory routes are ADMIN-only and protected
router.use(protect, authorize('ADMIN'));

router.get('/', getInventory);
router.get('/:id', getInventoryById);
router.post('/', createInventory);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);

module.exports = router;
