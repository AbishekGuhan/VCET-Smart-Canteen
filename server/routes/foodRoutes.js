const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getFoods);
router.get('/:id', getFoodById);
router.post('/', protect, authorize('ADMIN'), createFood);
router.put('/:id', protect, authorize('ADMIN'), updateFood);
router.delete('/:id', protect, authorize('ADMIN'), deleteFood);

module.exports = router;
