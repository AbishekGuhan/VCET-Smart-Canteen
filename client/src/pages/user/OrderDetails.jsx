import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../../services/orderService';

// ---------------------------------------------------------------------------
// Status timeline definition — display-only, no mutation allowed for students
// ---------------------------------------------------------------------------
const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

const STATUS_META = {
  PLACED:    { label: 'Placed',    icon: '📋', desc: 'Order received by VCET canteen system.' },
  CONFIRMED: { label: 'Confirmed', icon: '✅', desc: 'Canteen staff has confirmed your order.' },
  PREPARING: { label: 'Preparing', icon: '👨‍🍳', desc: 'Your food is being freshly prepared.' },
  READY:     { label: 'Ready',     icon: '🔔', desc: 'Order ready — collect from the counter.' },
  COMPLETED: { label: 'Completed', icon: '🎉', desc: 'Order collected. Enjoy your meal!' },
  CANCELLED: { label: 'Cancelled', icon: '❌', desc: 'This order has been cancelled.' },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pending',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' },
  PAID:    { label: 'Paid',     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  FAILED:  { label: 'Failed',   color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
};

// ---------------------------------------------------------------------------
// StatusTimeline component — display only
// ---------------------------------------------------------------------------
const StatusTimeline = ({ currentStatus }) => {
  const isCancelled = currentStatus === 'CANCELLED';
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
        <span className="text-2xl">❌</span>
        <div>
          <p className="text-sm font-bold text-red-400">Order Cancelled</p>
          <p className="text-xs text-slate-400">{STATUS_META.CANCELLED.desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, idx) => {
        const isDone    = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture  = idx > currentIndex;
        const meta = STATUS_META[step];

        return (
          <div key={step} className="flex items-start gap-4">
            {/* Step indicator + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : isDone
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                    : 'bg-slate-900 border-slate-700 text-slate-600'
                }`}
              >
                {isDone ? '✓' : meta.icon}
              </div>
              {/* Vertical connector (not for last step) */}
              {idx < STATUS_STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-1 mb-1 rounded-full ${
                    isDone ? 'bg-emerald-500/40' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>

            {/* Step text */}
            <div className={`pt-1.5 pb-4 ${idx === STATUS_STEPS.length - 1 ? 'pb-0' : ''}`}>
              <p
                className={`text-sm font-bold ${
                  isCurrent ? 'text-amber-400' : isDone ? 'text-emerald-400' : 'text-slate-600'
                }`}
              >
                {meta.label}
                {isCurrent && (
                  <span className="ml-2 text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </p>
              <p className={`text-xs mt-0.5 ${isFuture ? 'text-slate-700' : 'text-slate-500'}`}>
                {meta.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// OrderDetails Page
// Route: /orders/:id
// ---------------------------------------------------------------------------
const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

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
        else if (status === 404) setError('Order not found.');
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
        <p className="text-sm text-slate-400">Loading order details…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-10 shadow-xl">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to load order</h2>
          <p className="text-red-400 text-sm mb-6">{error}</p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
          >
            ← Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const paymentStatusCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.PENDING;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page Header ── */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Order Details</p>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <span className="font-mono text-amber-400">{order.tokenNumber}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">{formatDate(order.orderDate || order.createdAt)}</p>
        </div>
        <Link
          to="/orders"
          className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 text-xs transition-all text-center"
        >
          ← My Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Order Items + Summary ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Items Table */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <span>🍱</span> Order Items
              <span className="ml-auto text-xs font-normal text-slate-500">
                {order.items?.length} line {order.items?.length === 1 ? 'item' : 'items'}
              </span>
            </h2>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
              <span className="col-span-2">Item</span>
              <span className="text-center">Qty × Price</span>
              <span className="text-right">Subtotal</span>
            </div>

            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-0 items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800/50"
                >
                  {/* Name */}
                  <div className="col-span-2">
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    {/* Show historical price clearly labelled */}
                    <p className="text-xs text-slate-500 sm:hidden">
                      {item.quantity} × ₹{item.price} = ₹{item.subtotal}
                    </p>
                  </div>
                  {/* Qty × Price (desktop) */}
                  <p className="hidden sm:block text-xs text-slate-400 text-center">
                    {item.quantity} × ₹{item.price}
                    <span className="block text-[10px] text-slate-600">(price at order time)</span>
                  </p>
                  {/* Subtotal */}
                  <p className="hidden sm:block text-sm font-extrabold text-amber-400 text-right">
                    ₹{item.subtotal}
                  </p>
                </div>
              ))}
            </div>

            {/* Grand Total Row */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-sm font-bold text-white">Grand Total</span>
              <span className="text-2xl font-extrabold text-amber-400">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Order Meta Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <span>📋</span> Order Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID</span>
                <span className="font-mono text-slate-300 text-xs">{order._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Token</span>
                <span className="font-mono font-extrabold text-amber-400">{order.tokenNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="text-slate-200">{formatDate(order.orderDate || order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method</span>
                <span className="text-slate-200">
                  {order.paymentMethod === 'CASH_AT_CANTEEN' ? 'Cash at Canteen' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Status</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${paymentStatusCfg.bg} ${paymentStatusCfg.color}`}>
                  {paymentStatusCfg.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Status Timeline ── */}
        <div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl sticky top-24">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-slate-800 mb-5 flex items-center gap-2">
              <span>📍</span> Order Status
              <span className="ml-auto text-[10px] text-slate-500 font-normal">Display only</span>
            </h2>

            <StatusTimeline currentStatus={order.orderStatus} />

            {/* Re-order CTA */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to="/menu"
                className="block w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs text-center transition-all"
              >
                🍱 Order Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
