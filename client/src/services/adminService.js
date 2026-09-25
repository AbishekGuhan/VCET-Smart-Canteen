/**
 * adminService.js
 * Central API service for Admin operations (Dashboard, Sales, Inventory).
 */
import axios from 'axios';

// ── Dashboard Statistics ───────────────────────────────────────────────────
export const getAdminDashboardStats = async () => {
  const res = await axios.get('/api/admin/dashboard');
  return res.data;
};

// ── Sales Analytics ────────────────────────────────────────────────────────
export const getAdminSalesAnalytics = async () => {
  const res = await axios.get('/api/admin/sales');
  return res.data;
};

// ── Inventory CRUD ─────────────────────────────────────────────────────────
export const getInventory = async (lowStockOnly = false) => {
  const url = lowStockOnly ? '/api/inventory?lowStockOnly=true' : '/api/inventory';
  const res = await axios.get(url);
  return res.data;
};

export const getInventoryById = async (id) => {
  const res = await axios.get(`/api/inventory/${id}`);
  return res.data;
};

export const createInventory = async (data) => {
  const res = await axios.post('/api/inventory', data);
  return res.data;
};

export const updateInventory = async (id, data) => {
  const res = await axios.put(`/api/inventory/${id}`, data);
  return res.data;
};

export const deleteInventory = async (id) => {
  const res = await axios.delete(`/api/inventory/${id}`);
  return res.data;
};

// ── Admin Orders & UPI Verification ────────────────────────────────────────
export const getAdminOrders = async () => {
  const res = await axios.get('/api/admin/orders');
  return res.data;
};

export const updateOrderStatus = async (id, statusData) => {
  const res = await axios.patch(`/api/admin/orders/${id}/status`, statusData);
  return res.data;
};

// ── Helper to fetch foods for inventory creation ───────────────────────────
export const getFoodItems = async () => {
  const res = await axios.get('/api/food');
  return res.data;
};

