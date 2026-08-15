const Inventory = require('../models/Inventory');
const FoodItem = require('../models/FoodItem');
const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// @desc    Get all inventory items (populated with food item details)
// @route   GET /api/inventory
// @access  Private / Admin
// ---------------------------------------------------------------------------
const getInventory = async (req, res) => {
  try {
    const { lowStockOnly } = req.query;

    let filter = {};
    if (lowStockOnly === 'true') {
      filter.$expr = { $lte: ['$currentStock', '$minThreshold'] };
    }

    const inventory = await Inventory.find(filter)
      .populate('foodItem', 'name price image isAvailable prepTimeMinutes category')
      .sort({ currentStock: 1 });

    return res.status(200).json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch inventory records',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get single inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private / Admin
// ---------------------------------------------------------------------------
const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid inventory ID format' });
    }

    const item = await Inventory.findById(id).populate('foodItem', 'name price image isAvailable category');
    if (!item) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error('Get inventory by ID error:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch inventory item',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// @desc    Create an inventory record for a food item
// @route   POST /api/inventory
// @access  Private / Admin
// ---------------------------------------------------------------------------
const createInventory = async (req, res) => {
  try {
    const { foodItem, currentStock, minThreshold, unit } = req.body;

    if (!foodItem || currentStock === undefined) {
      return res.status(400).json({ message: 'Food item and current stock are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(foodItem)) {
      return res.status(400).json({ message: 'Invalid food item ID' });
    }

    // Verify FoodItem exists
    const food = await FoodItem.findById(foodItem);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Check if inventory already exists for this food item
    const existing = await Inventory.findOne({ foodItem });
    if (existing) {
      return res.status(400).json({ message: 'Inventory record already exists for this food item' });
    }

    const inventory = await Inventory.create({
      foodItem,
      currentStock: Number(currentStock),
      minThreshold: minThreshold !== undefined ? Number(minThreshold) : 10,
      unit: unit ? unit.trim() : 'portions',
      lastRestocked: new Date(),
    });

    const populated = await inventory.populate('foodItem', 'name price image isAvailable category');
    return res.status(201).json(populated);
  } catch (error) {
    console.error('Create inventory error:', error.message);
    return res.status(500).json({
      message: 'Failed to create inventory record',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// @desc    Update inventory stock / thresholds
// @route   PUT /api/inventory/:id
// @access  Private / Admin
// ---------------------------------------------------------------------------
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStock, minThreshold, unit, restockQuantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid inventory ID format' });
    }

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }

    if (restockQuantity !== undefined && !isNaN(restockQuantity)) {
      item.currentStock += Number(restockQuantity);
      item.lastRestocked = new Date();
    } else if (currentStock !== undefined) {
      item.currentStock = Number(currentStock);
      item.lastRestocked = new Date();
    }

    if (minThreshold !== undefined) {
      item.minThreshold = Number(minThreshold);
    }

    if (unit !== undefined) {
      item.unit = unit.trim();
    }

    const updated = await item.save();
    const populated = await updated.populate('foodItem', 'name price image isAvailable category');

    return res.status(200).json(populated);
  } catch (error) {
    console.error('Update inventory error:', error.message);
    return res.status(500).json({
      message: 'Failed to update inventory record',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// @desc    Delete inventory record
// @route   DELETE /api/inventory/:id
// @access  Private / Admin
// ---------------------------------------------------------------------------
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid inventory ID format' });
    }

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }

    await Inventory.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Inventory record deleted successfully' });
  } catch (error) {
    console.error('Delete inventory error:', error.message);
    return res.status(500).json({
      message: 'Failed to delete inventory record',
      error: error.message,
    });
  }
};

module.exports = {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
};
