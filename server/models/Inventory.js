const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: [true, 'Food item reference is required'],
      unique: true,
    },
    currentStock: {
      type: Number,
      required: [true, 'Current stock is required'],
      default: 0,
      min: 0,
    },
    minThreshold: {
      type: Number,
      default: 10,
    },
    unit: {
      type: String,
      default: 'portions',
      trim: true,
    },
    lastRestocked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inventory', inventorySchema);
