/**
 * orderService.js
 * Central place for all order-related API calls.
 * Uses axios with the Authorization header already set globally by AuthContext.
 */
import axios from 'axios';

/**
 * POST /api/orders
 * Sends { items: [{ foodItem, quantity }], transactionId, paymentMethod }.
 * Backend calculates all prices — never send price/subtotal/totalAmount.
 */
export const createOrder = async (cartItems, paymentData = {}) => {
  const payload = {
    items: cartItems.map((item) => ({
      foodItem: item._id,
      quantity: item.quantity,
    })),
    transactionId: paymentData.transactionId || '',
    paymentMethod: paymentData.paymentMethod || 'UPI',
  };
  const res = await axios.post('/api/orders', payload);
  return res.data; // { message, order }
};

/**
 * GET /api/orders
 * Returns the authenticated user's orders, newest first.
 */
export const getOrders = async () => {
  const res = await axios.get('/api/orders');
  return res.data; // { count, orders }
};

/**
 * GET /api/orders/:id
 * Returns a single order. Backend enforces ownership (403 if not owner).
 */
export const getOrderById = async (id) => {
  const res = await axios.get(`/api/orders/${id}`);
  return res.data; // { order }
};
