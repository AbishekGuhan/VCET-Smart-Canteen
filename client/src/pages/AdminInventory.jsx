import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getFoodItems,
} from '../services/adminService';

// ---------------------------------------------------------------------------
// Admin Inventory Management Page (/admin/inventory)
// Protected: ADMIN role only
// ---------------------------------------------------------------------------
const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    foodItem: '',
    currentStock: '',
    minThreshold: '10',
    unit: 'portions',
  });

  // Quick Restock state
  const [restockModal, setRestockModal] = useState({ show: false, item: null, quantity: '' });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [invData, foodsData] = await Promise.all([
        getInventory(lowStockFilter),
        getFoodItems(),
      ]);
      setInventory(invData);
      setFoodItems(foodsData);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      const status = err.response?.status;
      if (status === 403) setError('Access denied. Administrator privileges required.');
      else setError('Failed to load inventory data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lowStockFilter]);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ── Open Add Modal ────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      foodItem: foodItems.length > 0 ? foodItems[0]._id : '',
      currentStock: '',
      minThreshold: '10',
      unit: 'portions',
    });
    setShowModal(true);
  };

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setFormData({
      foodItem: item.foodItem?._id || '',
      currentStock: item.currentStock,
      minThreshold: item.minThreshold,
      unit: item.unit || 'portions',
    });
    setShowModal(true);
  };

  // ── Form Submit (Create / Update) ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateInventory(editingId, {
          currentStock: Number(formData.currentStock),
          minThreshold: Number(formData.minThreshold),
          unit: formData.unit,
        });
        showNotification('Inventory item updated successfully!');
      } else {
        await createInventory({
          foodItem: formData.foodItem,
          currentStock: Number(formData.currentStock),
          minThreshold: Number(formData.minThreshold),
          unit: formData.unit,
        });
        showNotification('New inventory item added successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  // ── Quick Restock Submit ──────────────────────────────────────────────────
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(restockModal.quantity);
    if (!qty || qty <= 0) {
      alert('Please enter a positive restock quantity');
      return;
    }
    try {
      await updateInventory(restockModal.item._id, {
        restockQuantity: qty,
      });
      showNotification(`Added ${qty} ${restockModal.item.unit} to ${restockModal.item.foodItem?.name}!`);
      setRestockModal({ show: false, item: null, quantity: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Restock failed');
    }
  };

  // ── Delete Item ───────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete inventory record for "${name}"?`)) return;
    try {
      await deleteInventory(id);
      showNotification(`Deleted inventory record for ${name}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minThreshold).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Top Header Banner ── */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
            VCET Inventory Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Cafeteria Stock & Low-Stock Tracking
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time tracking of kitchen supplies, threshold alarms, and restock records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all"
          >
            ← Admin Dashboard
          </Link>
          <Link
            to="/admin/sales"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all"
          >
            📊 View Sales
          </Link>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:shadow-amber-500/25 transition-all flex items-center gap-1.5"
          >
            <span>+</span> Add Stock Item
          </button>
        </div>
      </div>

      {/* ── Notification Banner ── */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2 animate-fadeIn">
          <span>✅</span> {successMsg}
        </div>
      )}

      {/* ── Controls & Filter Bar ── */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLowStockFilter(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              !lowStockFilter
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Items ({inventory.length})
          </button>
          <button
            onClick={() => setLowStockFilter(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              lowStockFilter
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>⚠️</span> Low Stock Only ({lowStockCount})
          </button>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-all flex items-center gap-1.5"
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span> Refresh
        </button>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 bg-slate-950/40 rounded-2xl border border-slate-800 p-12">
          <div className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading inventory records…</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-10 shadow-xl text-center max-w-lg mx-auto my-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-400 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && inventory.length === 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {lowStockFilter ? 'No Low-Stock Items Found' : 'No Inventory Items Yet'}
          </h3>
          <p className="text-slate-400 text-xs mb-6">
            {lowStockFilter
              ? 'All inventory items are currently well-stocked above their minimum threshold.'
              : 'Add your first food item to the inventory system to begin tracking portions and stock levels.'}
          </p>
          {!lowStockFilter && (
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
            >
              + Add Item to Inventory
            </button>
          )}
        </div>
      )}

      {/* ── Inventory Table / Card Grid ── */}
      {!loading && !error && inventory.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Food Item</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6 text-center">Current Stock</th>
                  <th className="py-4 px-6 text-center">Min Threshold</th>
                  <th className="py-4 px-6">Last Restocked</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {inventory.map((item) => {
                  const isLow = item.currentStock <= item.minThreshold;
                  const isOut = item.currentStock === 0;

                  return (
                    <tr key={item._id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Food Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {item.foodItem?.image ? (
                            <img
                              src={item.foodItem.image}
                              alt={item.foodItem?.name}
                              className="h-10 w-10 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0">
                              🍱
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{item.foodItem?.name || 'Unknown Food'}</p>
                            <p className="text-xs text-slate-500">
                              ₹{item.foodItem?.price || 0} • {item.unit || 'portions'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-6">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1 w-max">
                            <span>⚠️</span> Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Optimal
                          </span>
                        )}
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-6 text-center">
                        <span className={`font-mono font-extrabold text-base ${isLow ? 'text-red-400' : 'text-slate-200'}`}>
                          {item.currentStock}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
                      </td>

                      {/* Min Threshold */}
                      <td className="py-4 px-6 text-center text-xs font-mono text-slate-400">
                        {item.minThreshold} {item.unit}
                      </td>

                      {/* Last Restocked */}
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString('en-IN') : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setRestockModal({ show: true, item, quantity: '' })}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
                            title="Add stock"
                          >
                            + Restock
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs transition-all"
                            title="Edit thresholds"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.foodItem?.name || 'this item')}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs transition-all"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Inventory Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Inventory Item' : 'Add Item to Inventory'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isEditing ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Food Item
                  </label>
                  <select
                    value={formData.foodItem}
                    onChange={(e) => setFormData({ ...formData, foodItem: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                  >
                    {foodItems.map((food) => (
                      <option key={food._id} value={food._id}>
                        {food.name} (₹{food.price})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Current Stock Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  placeholder="e.g. 50"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Min Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="portions / plates"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-md transition-all"
                >
                  {isEditing ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Quick Restock Modal ── */}
      {restockModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Restock {restockModal.item?.foodItem?.name}
              </h3>
              <button
                onClick={() => setRestockModal({ show: false, item: null, quantity: '' })}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Current stock: <span className="font-bold text-white">{restockModal.item?.currentStock} {restockModal.item?.unit}</span>
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={restockModal.quantity}
                  onChange={(e) => setRestockModal({ ...restockModal, quantity: e.target.value })}
                  placeholder={`e.g. 20 ${restockModal.item?.unit}`}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRestockModal({ show: false, item: null, quantity: '' })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-all"
                >
                  + Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
