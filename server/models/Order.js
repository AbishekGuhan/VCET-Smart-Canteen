const mongoose = require('mongoose');

// Sub-schema for each ordered item.
// Stores a snapshot of name and price at order time — historical accuracy preserved.
const orderItemSchema = new mongoose.Schema(
  {
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      // Price snapshot at time of order — never recalculated from live data
      type: Number,
      required: true,
    },
    subtotal: {
      // Precomputed: price × quantity
      type: Number,
      required: true,
    },
  },
  { _id: false } // No separate _id for sub-documents
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },

    tokenNumber: {
      type: String,
      required: true,
      unique: true,
    },

    orderStatus: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
      default: 'PLACED',
    },

    paymentMethod: {
      type: String,
      enum: ['UPI'],
      default: 'UPI',
    },

    transactionId: {
      type: String,
      trim: true,
      default: '',
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PENDING_VERIFICATION', 'VERIFIED', 'PAID', 'FAILED'],
      default: 'PENDING',
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Order', orderSchema);
