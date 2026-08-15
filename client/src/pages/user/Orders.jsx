import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../../services/orderService';

// ---------------------------------------------------------------------------
// Status badge config (shared colour palette with OrderConfirmation)
// ---------------------------------------------------------------------------
const STATUS_CONFIG = {
  PLACED:    { label: 'Placed',    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30' },
  CONFIRMED: { label: 'Confirmed', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' },
  PREPARING: { label: 'Preparing', color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30' },
  READY:     { label: 'Ready',     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

// ---------------------------------------------------------------------------
// Orders (Order History) Page
// Route: /orders  —  ProtectedRoute (all authenticated roles)
// ---------------------------------------------------------------------------
const Orders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        if (!cancelled) setOrders(data.orders || []);
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) setError('Your session has expired. Please log in again.');
        else setError('Failed to load your orders. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => { cancelled = true; };
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your orders…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-10 shadow-xl">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Could not load orders</h2>
          <p className="text-red-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty State ──────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-10 shadow-xl max-w-lg mx-auto">
          <div className="text-5xl mb-4">📜</div>
          <h2 className="text-2xl font-extrabold text-white mb-2">No Orders Yet</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            You haven't placed any orders at the VCET canteen yet. Browse the menu and place your first order!
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm"
          >
            <span>🍱</span> Browse Food Menu
          </Link>
        </div>
      </div>
    );
  }

  // ── Order List ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>📜</span> My Orders
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed at VCET canteen
          </p>
        </div>
        <Link
          to="/menu"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
        >
          + New Order
        </Link>
      </div>

      {/* Order Cards */}
      <div className="space-y-4">
        {orders.map((order) => {
          const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PLACED;
          const itemCount = order.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

          return (
            <div
              key={order._id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                {/* Left: Order meta */}
                <div className="flex-1 min-w-0">
                  {/* Token + Status row */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-mono font-extrabold text-amber-400 text-lg tracking-tight">
                      {order.tokenNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Order details row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>🗓 {formatDate(order.orderDate || order.createdAt)}</span>
                    <span>🍱 {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                    <span className="text-slate-300 font-semibold">₹{order.totalAmount}</span>
                  </div>

                  {/* Order ID */}
                  <p className="text-[10px] text-slate-600 font-mono mt-1.5 truncate">
                    ID: {order._id}
                  </p>
                </div>

                {/* Right: View Details button */}
                <Link
                  to={`/orders/${order._id}`}
                  id={`order-detail-btn-${order._id}`}
                  className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700 text-xs transition-all text-center"
                >
                  View Details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm sm:hidden"
        >
          + New Order
        </Link>
      </div>
    </div>
  );
};

export default Orders;
