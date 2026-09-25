import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../../services/orderService';

// ---------------------------------------------------------------------------
// Status display config
// ---------------------------------------------------------------------------
const STATUS_CONFIG = {
  PLACED:     { label: 'Placed',     color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',   icon: '📋' },
  CONFIRMED:  { label: 'Confirmed',  color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/30', icon: '✅' },
  PREPARING:  { label: 'Preparing',  color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30',icon: '👨‍🍳' },
  READY:      { label: 'Ready',      color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/30',icon: '🔔' },
  COMPLETED:  { label: 'Completed',  color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/30',icon: '🎉' },
  CANCELLED:  { label: 'Cancelled',  color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',     icon: '❌' },
};

// ---------------------------------------------------------------------------
// Helper: format ISO date string to readable form
// ---------------------------------------------------------------------------
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

// ---------------------------------------------------------------------------
// OrderConfirmation Page
// Route: /order-confirmation/:id
// ---------------------------------------------------------------------------
const OrderConfirmation = () => {
  const { id } = useParams();

  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        if (!cancelled) setOrder(data.order);
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) setError('Your session has expired. Please log in again.');
        else if (status === 403) setError('You are not authorised to view this order.');
        else if (status === 404) setError('Order not found. It may have been removed.');
        else setError('Failed to load order details. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    return () => { cancelled = true; };
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your order…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-10 shadow-xl">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-red-400 text-sm mb-6">{error}</p>
          <Link to="/orders" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all">
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PLACED;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Success Banner ── */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-950 to-slate-950 border border-emerald-500/25 shadow-xl text-center mb-8">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
          Order Placed Successfully!
        </h1>
        <p className="text-slate-400 text-sm">
          Your order has been received by the VCET canteen. Head to the counter with your token.
        </p>
      </div>

      {/* ── Token Card ── */}
      <div className="p-8 rounded-2xl bg-slate-950 border border-amber-500/30 shadow-xl mb-6 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Pickup Token</p>
        <div className="text-5xl font-extrabold text-amber-400 tracking-tight mb-1 font-mono">
          {order.tokenNumber}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Show this token at the VCET canteen counter to collect your order.
        </p>
      </div>

      {/* ── Order Details Card ── */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg space-y-4 mb-6">
        <h2 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
          <span>📋</span> Order Details
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Order ID</span>
            <span className="font-mono text-slate-300 text-xs">{order._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Order Date</span>
            <span className="text-slate-200 font-medium">{formatDate(order.orderDate || order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Method</span>
            <span className="text-slate-200 font-medium">
              UPI / Online Payment
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Status</span>
            <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
              {statusCfg.icon} {statusCfg.label}
            </span>
          </div>

          {/* Ordered Items Summary */}
          {order.items && order.items.length > 0 && (
            <div className="pt-3 border-t border-slate-900 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Items</span>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-300">
                    {item.name} <span className="text-slate-500 font-mono">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-slate-200">₹{item.subtotal || item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <span className="font-bold text-white text-sm">Total Amount</span>
            <span className="font-extrabold text-amber-400 text-lg">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* ── Pickup Instructions ── */}
      <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 mb-8">
        <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
          <span>🏪</span> Pickup Instructions
        </h3>
        <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed list-none">
          <li>• Visit the VCET canteen counter with your token <span className="text-amber-400 font-bold">{order.tokenNumber}</span>.</li>
          <li>• Your UPI payment reference is recorded and verified by canteen staff.</li>
          <li>• Your meal will be ready when status changes to <span className="text-emerald-400 font-semibold">READY</span>.</li>
          <li>• Canteen hours: Monday–Saturday, 7:30 AM – 5:30 PM.</li>
        </ul>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/orders"
          id="view-orders-btn"
          className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-sm text-center transition-all"
        >
          📜 View My Orders
        </Link>
        <Link
          to="/menu"
          id="back-to-menu-btn"
          className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 text-sm text-center transition-all"
        >
          🍱 Back to Menu
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
