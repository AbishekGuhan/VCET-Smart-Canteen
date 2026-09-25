import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboardStats, getAdminOrders, updateOrderStatus } from '../services/adminService';

// ---------------------------------------------------------------------------
// Admin Dashboard Page (/admin)
// Protected: ADMIN role only
// ---------------------------------------------------------------------------
const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [error, setError] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL'); // ALL, PENDING_VERIFICATION, PREPARING, READY, COMPLETED
  const [copiedId, setCopiedId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, ordersData] = await Promise.all([
        getAdminDashboardStats(),
        getAdminOrders(),
      ]);
      setStats(statsData);
      setOrders(ordersData.orders || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      const status = err.response?.status;
      if (status === 403) {
        setError('Access denied. Administrator privileges are required.');
      } else if (status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Unable to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newOrderStatus, newPaymentStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const payload = {};
      if (newOrderStatus) payload.orderStatus = newOrderStatus;
      if (newPaymentStatus) payload.paymentStatus = newPaymentStatus;

      const res = await updateOrderStatus(orderId, payload);
      if (res.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.order : o))
        );
        // Refresh stats
        const freshStats = await getAdminDashboardStats();
        setStats(freshStats);
      }
    } catch (err) {
      console.error('Failed to update order:', err);
      alert('Error updating order: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCopyTransactionId = (txId, orderId) => {
    navigator.clipboard.writeText(txId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ── Filtered Orders ────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'PENDING_VERIFICATION') {
      return order.paymentStatus === 'PENDING_VERIFICATION' && order.orderStatus !== 'CANCELLED';
    }
    return order.orderStatus === orderFilter;
  });

  // ── Stat Card Configuration ───────────────────────────────────────────────
  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: '📦',
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/30',
      description: 'Lifetime orders recorded in system',
    },
    {
      title: "Today's Orders",
      value: stats?.todayOrders ?? 0,
      icon: '📅',
      color: 'text-amber-400',
      bgGradient: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/30',
      description: 'Orders placed today',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      icon: '⏳',
      color: 'text-orange-400',
      bgGradient: 'from-orange-500/10 to-transparent',
      borderColor: 'border-orange-500/30',
      description: 'Active in kitchen / queue',
    },
    {
      title: 'Completed Orders',
      value: stats?.completedOrders ?? 0,
      icon: '✅',
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      description: 'Fulfilled & collected at canteen',
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalSales ?? 0).toLocaleString('en-IN')}`,
      icon: '💰',
      color: 'text-green-400',
      bgGradient: 'from-green-500/10 to-transparent',
      borderColor: 'border-green-500/30',
      description: 'Gross sales from confirmed orders',
    },
    {
      title: 'Available Menu',
      value: stats?.availableFood ?? 0,
      icon: '🍱',
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/10 to-transparent',
      borderColor: 'border-cyan-500/30',
      description: 'Active food items on menu',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Top Header Banner ── */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
            VCET Canteen Administration Portal
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Canteen Operations & Live Orders
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Logged in as <span className="text-white font-semibold">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/inventory"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>📦</span> Manage Inventory
          </Link>
          <Link
            to="/admin/sales"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>📊</span> Sales Analytics
          </Link>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-2"
            title="Refresh statistics and orders"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span> Refresh Live Orders
          </button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 bg-slate-950/40 rounded-2xl border border-slate-800 p-12">
          <div className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading Canteen metrics and live incoming orders…</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-10 shadow-xl text-center max-w-lg mx-auto my-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-red-400 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            Retry Request
          </button>
        </div>
      )}

      {/* ── Dashboard Content ── */}
      {!loading && !error && stats && (
        <div className="space-y-10">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((card, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-slate-950 border bg-gradient-to-br ${card.bgGradient} ${card.borderColor} shadow-lg flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  <div className={`text-2xl font-black tracking-tight ${card.color}`}>
                    {card.value}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal pt-2 mt-2 border-t border-slate-900">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* ── Live Orders & UPI Verification Section ── */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">⚡</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Live Orders & UPI Verification
                  </h2>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Cross-check student UPI transaction IDs with Canteen Phone <strong className="text-amber-400">+91 9994994991</strong>
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
                {[
                  { key: 'ALL', label: `All (${orders.length})` },
                  {
                    key: 'PENDING_VERIFICATION',
                    label: `Pending UPI (${orders.filter((o) => o.paymentStatus === 'PENDING_VERIFICATION').length})`,
                  },
                  {
                    key: 'PREPARING',
                    label: `Preparing (${orders.filter((o) => o.orderStatus === 'PREPARING').length})`,
                  },
                  {
                    key: 'READY',
                    label: `Ready (${orders.filter((o) => o.orderStatus === 'READY').length})`,
                  },
                  {
                    key: 'COMPLETED',
                    label: `Done (${orders.filter((o) => o.orderStatus === 'COMPLETED').length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setOrderFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      orderFilter === tab.key
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List / Cards */}
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <div className="text-4xl">📭</div>
                <p className="text-sm font-semibold text-slate-400">No orders match this filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const student = order.user || {};
                  const isUpdating = updatingOrderId === order._id;

                  return (
                    <div
                      key={order._id}
                      className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-lg space-y-5"
                    >
                      {/* Top Bar: Token + Status Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-black text-base sm:text-lg">
                            🎫 {order.tokenNumber}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Payment Method & Status Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            }`}
                          >
                            💳 {order.paymentMethod}: {order.paymentStatus}
                          </span>

                          {/* Order Status Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              order.orderStatus === 'COMPLETED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : order.orderStatus === 'READY'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : order.orderStatus === 'PREPARING'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            ● {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Middle Details Grid: Student Info + Payment Info + Items */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                        {/* 1. Student Information */}
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                          <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800 flex items-center gap-1.5">
                            <span>👤</span> Student Details
                          </div>
                          <div>
                            <span className="text-slate-500 block">Name:</span>
                            <span className="text-white font-bold text-sm">{student.name || 'Unknown User'}</span>
                          </div>
                          {student.registerNumber && (
                            <div>
                              <span className="text-slate-500 block">Roll / Register No:</span>
                              <span className="text-amber-400 font-mono font-bold">{student.registerNumber}</span>
                            </div>
                          )}
                          {student.department && (
                            <div>
                              <span className="text-slate-500 block">Department:</span>
                              <span className="text-slate-300">{student.department}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-500 block">Phone:</span>
                            <span className="text-slate-300 font-mono">{student.phone || 'N/A'}</span>
                          </div>
                        </div>

                        {/* 2. Payment & Transaction Info */}
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
                          <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800 flex items-center gap-1.5">
                            <span>📱</span> Payment Verification
                          </div>
                          <div>
                            <span className="text-slate-500 block">Amount to Verify:</span>
                            <span className="text-2xl font-black text-amber-400 font-mono">₹{order.totalAmount}</span>
                          </div>

                          <div>
                            <span className="text-slate-500 block mb-1">UPI Transaction / UTR ID:</span>
                            {order.transactionId ? (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-amber-500/30">
                                <span className="font-mono text-amber-300 font-bold truncate flex-1 select-all">
                                  {order.transactionId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTransactionId(order.transactionId, order._id)}
                                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded text-[10px] font-bold shrink-0 transition-colors"
                                >
                                  {copiedId === order._id ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">No Transaction ID (Cash Order)</span>
                            )}
                          </div>
                        </div>

                        {/* 3. Items Ordered */}
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                          <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800 flex items-center gap-1.5">
                            <span>🍱</span> Ordered Items ({order.items?.length || 0})
                          </div>
                          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-slate-300">
                                <span className="truncate pr-2">
                                  <strong className="text-amber-400 font-mono mr-1.5">{item.quantity}x</strong>
                                  {item.name}
                                </span>
                                <span className="text-slate-400 shrink-0 font-mono">₹{item.subtotal}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        {/* 1. UPI: Step 1 (Pending Verification / Placed) */}
                        {order.orderStatus === 'PLACED' && order.orderStatus !== 'CANCELLED' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order._id, 'PREPARING', 'VERIFIED')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <span>✅</span>
                            <span>Verify UPI & Start Preparing</span>
                          </button>
                        )}

                        {/* Step 2: Preparing -> Mark Ready for Pickup */}
                        {order.orderStatus === 'PREPARING' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order._id, 'READY', order.paymentStatus || 'VERIFIED')}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <span>🔔</span>
                            <span>Mark Ready for Pickup</span>
                          </button>
                        )}

                        {/* Step 3: Ready -> Complete Order */}
                        {order.orderStatus === 'READY' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleUpdateStatus(
                                order._id,
                                'COMPLETED',
                                'VERIFIED'
                              )
                            }
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <span>🎉</span>
                            <span>Hand Over & Complete Order</span>
                          </button>
                        )}

                        {/* Step 4: Completed State */}
                        {order.orderStatus === 'COMPLETED' && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <span>✨</span> Completed & Handed Over
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
