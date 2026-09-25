const mongoose = require('mongoose');
const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');

// ---------------------------------------------------------------------------
// Helper: Generate a unique token in the format VCET-XXXX (e.g. VCET-1042)
// Retries on collision (extremely rare with 9000 possible values,
// but handled correctly for correctness).
// ---------------------------------------------------------------------------
const generateUniqueToken = async () => {
  let token;
  let isUnique = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 10;

  while (!isUnique && attempts < MAX_ATTEMPTS) {
    const number = Math.floor(1000 + Math.random() * 9000); // 1000–9999
    token = `VCET-${number}`;

    // Check collision in DB
    const existing = await Order.findOne({ tokenNumber: token });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate a unique token after multiple attempts');
  }

  return token;
};

// ---------------------------------------------------------------------------
// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (protect)
// ---------------------------------------------------------------------------
const createOrder = async (req, res) => {
  try {
    const { items, transactionId, paymentMethod } = req.body;

    // ── 1. Verify authenticated user ────────────────────────────────────────
    // req.user is set by the protect middleware — never trust user ID from body
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // ── 2. Validate items array ─────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Please add items before placing an order.' });
    }

    // ── 3 & 4. Validate each item's foodItem ID and quantity ─────────────────
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Validate foodItem is a valid MongoDB ObjectId
      if (!item.foodItem || !mongoose.Types.ObjectId.isValid(item.foodItem)) {
        return res.status(400).json({
          message: `Invalid food item ID at position ${i + 1}`,
        });
      }

      // Validate quantity is a positive integer
      const qty = item.quantity;
      if (!qty || !Number.isInteger(Number(qty)) || Number(qty) < 1) {
        return res.status(400).json({
          message: `Invalid quantity for item at position ${i + 1}. Quantity must be a positive integer.`,
        });
      }
    }

    // ── 5. Fetch FoodItem records from MongoDB ───────────────────────────────
    const orderItems = [];
    let totalAmount = 0;

    for (let i = 0; i < items.length; i++) {
      const { foodItem: foodId, quantity } = items[i];
      const qty = parseInt(quantity, 10);

      const food = await FoodItem.findById(foodId);
      if (!food) {
        return res.status(404).json({
          message: `Food item not found: ${foodId}`,
        });
      }

      if (!food.isAvailable) {
        return res.status(400).json({
          message: `"${food.name}" is currently not available. Please remove it from your cart.`,
        });
      }

      const priceFromDB = food.price;
      const subtotal = parseFloat((priceFromDB * qty).toFixed(2));
      totalAmount += subtotal;

      orderItems.push({
        foodItem: food._id,
        name: food.name,
        quantity: qty,
        price: priceFromDB,
        subtotal,
      });
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // ── 14. Generate unique token ────────────────────────────────────────────
    const tokenNumber = await generateUniqueToken();

    const selectedPaymentMethod = 'UPI';
    const initialPaymentStatus = 'PENDING_VERIFICATION';

    // ── 15. Create the order using req.user._id ──────────────────────────────
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      tokenNumber,
      orderStatus: 'PLACED',
      paymentMethod: selectedPaymentMethod,
      transactionId: transactionId ? transactionId.trim() : '',
      paymentStatus: initialPaymentStatus,
      orderDate: new Date(),
    });

    // ── 16. Return the created order ─────────────────────────────────────────
    return res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error.message);
    return res.status(500).json({
      message: 'Server error while placing order',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get all orders for the authenticated user
// @route   GET /api/orders
// @access  Private (protect)
// ---------------------------------------------------------------------------
const getUserOrders = async (req, res) => {
  try {
    // For STUDENT and STAFF: return only their own orders
    // (ADMIN order management is a separate task — not implemented here)
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // newest first
      .populate('user', 'name email role'); // populate basic user info

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error.message);
    return res.status(500).json({
      message: 'Server error while fetching orders',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private (protect)
// ---------------------------------------------------------------------------
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(id).populate('user', 'name email role');

    // Order not found
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ownership check — users can only view their own orders (unless ADMIN)
    const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
    if (orderUserId !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to view this order',
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Get order by ID error:', error.message);
    return res.status(500).json({
      message: 'Server error while fetching order',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get all orders with student details (Admin only)
// @route   GET /api/admin/orders
// @access  Private / Admin
// ---------------------------------------------------------------------------
const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email role department registerNumber phone');

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get admin orders error:', error.message);
    return res.status(500).json({
      message: 'Server error while fetching all orders',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// @desc    Update order status / payment status (Admin only)
// @route   PATCH /api/admin/orders/:id/status
// @access  Private / Admin
// ---------------------------------------------------------------------------
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    const updated = await Order.findById(id).populate('user', 'name email role department registerNumber phone');

    return res.status(200).json({
      message: 'Order updated successfully',
      order: updated,
    });
  } catch (error) {
    console.error('Update order status error:', error.message);
    return res.status(500).json({
      message: 'Server error while updating order',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrdersForAdmin,
  updateOrderStatus,
};

