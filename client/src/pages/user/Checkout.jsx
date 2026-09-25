import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

// ---------------------------------------------------------------------------
// Checkout Page
// Route: /checkout (ProtectedRoute — all authenticated roles)
// ---------------------------------------------------------------------------
const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, clearCart, total, totalItemsCount } = useCart();
  const navigate = useNavigate();

  const paymentMethod = 'UPI';
  const [transactionId, setTransactionId] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [apiError, setApiError] = useState('');

  const canteenPhone = '+91 9994994991';
  const rawPhone = '9994994991';

  const defaultImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(rawPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  // ── Empty Cart Guard ──────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-10 shadow-xl max-w-lg mx-auto">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Your Cart is Empty</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            There are no items to checkout. Please add items from the menu first.
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

  // ── Place Order Handler ───────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (isPlacing) return;

    setApiError('');

    if (!transactionId || transactionId.trim().length < 4) {
      setApiError('Please enter your 12-digit UPI Transaction / UTR ID after making the payment.');
      return;
    }

    setIsPlacing(true);

    try {
      const data = await createOrder(cartItems, {
        transactionId: transactionId.trim(),
        paymentMethod: 'UPI',
      });
      const createdOrder = data.order;

      clearCart();
      navigate(`/order-confirmation/${createdOrder._id}`);
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;

      if (status === 401) {
        setApiError('Your session has expired. Please log in again.');
      } else if (status === 400) {
        setApiError(serverMsg || 'One or more items in your cart are unavailable. Please review your cart.');
      } else if (status === 404) {
        setApiError(serverMsg || 'A food item in your cart no longer exists. Please update your cart.');
      } else if (!err.response) {
        setApiError('Network error — please check your internet connection and try again.');
      } else {
        setApiError(serverMsg || 'Something went wrong while placing your order. Please try again.');
      }
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Page Header ── */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🧾</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Checkout & Online Payment
          </h1>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm">
          Pay seamlessly via UPI / QR — order instantly verified and prepared with pickup token.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT: Customer Info + Order Items + UPI Payment Instructions ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Student Profile Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-800">
              <span>👤</span> Student Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Name</span>
                <span className="font-bold text-slate-200">{user?.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Email</span>
                <span className="font-medium text-slate-300">{user?.email}</span>
              </div>
              {user?.registerNumber && (
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Register / Roll No.</span>
                  <span className="font-bold text-amber-400 font-mono">{user.registerNumber}</span>
                </div>
              )}
              {user?.department && (
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Department</span>
                  <span className="font-medium text-slate-300">{user.department}</span>
                </div>
              )}
              {user?.phone && (
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Phone Number</span>
                  <span className="font-medium text-slate-300">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* College Canteen UPI Payment Banner */}
          {paymentMethod === 'UPI' && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border-2 border-amber-500/40 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
                    <span>⚡</span> Official Canteen UPI Account
                  </div>
                  <h3 className="text-lg font-black text-white">VCET Canteen Payment Details</h3>
                  <p className="text-xs text-slate-400">Pay using Google Pay, PhonePe, Paytm, or any UPI App</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700">GPay</span>
                  <span className="px-2.5 py-1 bg-purple-900/40 text-purple-300 text-xs font-bold rounded-lg border border-purple-700/40">PhonePe</span>
                  <span className="px-2.5 py-1 bg-blue-900/40 text-blue-300 text-xs font-bold rounded-lg border border-blue-700/40">Paytm</span>
                  <span className="px-2.5 py-1 bg-emerald-900/40 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-700/40">BHIM</span>
                </div>
              </div>

              {/* Payment Phone Number Highlight Card */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">VCET Canteen Payment Mobile / UPI Number:</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-wider">
                    {canteenPhone}
                  </div>
                  <span className="text-[11px] text-slate-500">Beneficiary: Velammal College Canteen Counter</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold rounded-xl border border-amber-500/40 text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{copiedPhone ? '✅' : '📋'}</span>
                  <span>{copiedPhone ? 'Copied to Clipboard!' : 'Copy Mobile Number'}</span>
                </button>
              </div>

              {/* Step-by-Step Payment Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
                    <span>Open Payment App</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Open GPay, PhonePe, or Paytm and send <strong className="text-white">₹{total}</strong> to <strong className="text-amber-300 font-mono">{rawPhone}</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                    <span>Get Transaction ID</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    After paying, copy the <strong className="text-white">12-digit UPI Ref / UTR / Transaction ID</strong> from payment receipt.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
                    <span>Paste & Confirm</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Paste the Transaction ID in the input box below and place your order to get your pickup token.
                  </p>
                </div>
              </div>

              {/* Transaction ID Input Field */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Enter UPI Transaction ID / UTR Number *
                </label>
                <input
                  id="transaction-id"
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 428910293812 or UPI Ref / UTR ID"
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-amber-500/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 text-sm font-mono transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <span>ℹ️</span>
                  <span>This ID will be instantly verified by the Canteen Admin for your order preparation.</span>
                </p>
              </div>
            </div>
          )}

          {/* Order Items Table */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-800">
              <span>🍱</span> Order Items
              <span className="ml-auto text-xs font-normal text-slate-500">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
            </h2>

            <div className="space-y-3">
              {cartItems.map((item) => {
                const itemSubtotal = item.price * item.quantity;
                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60"
                  >
                    <img
                      src={item.image || defaultImage}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                      onError={(e) => { e.target.src = defaultImage; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500 uppercase font-medium">Subtotal</p>
                      <p className="text-sm font-extrabold text-amber-400">₹{itemSubtotal}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Payment Method Selector + Order Total ── */}
        <div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-6 sticky top-24">

            {/* Order Summary */}
            <div>
              <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
                <span>📋</span> Bill Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Items Total ({totalItemsCount})</span>
                  <span className="font-semibold text-slate-200">₹{total}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Campus Service Fee</span>
                  <span className="font-semibold text-emerald-400">FREE (₹0)</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Grand Total</span>
                  <span className="font-extrabold text-amber-400 text-3xl font-mono">₹{total}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Badge */}
            <div>
              <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800 mb-3 flex items-center gap-2">
                <span>💳</span> Payment Method
              </h2>
              <div className="p-3.5 rounded-xl border border-amber-500/50 bg-amber-500/10 flex items-start gap-3">
                <span className="text-xl mt-0.5">📱</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-amber-400">
                      UPI / Online Payment
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                      Instant Token
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pay to <span className="text-amber-300 font-mono">{canteenPhone}</span> & enter Transaction ID
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {apiError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed space-y-2"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>{apiError}</span>
                </div>
                {apiError.toLowerCase().includes('not found') && (
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      navigate('/menu');
                    }}
                    className="w-full mt-2 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-lg border border-red-500/40 text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🗑️</span>
                    <span>Clear Stale Cart & Pick Fresh Items</span>
                  </button>
                )}
              </div>
            )}

            {/* Place Order Button */}
            <button
              id="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isPlacing}
              className={`w-full py-4 px-4 font-bold rounded-xl shadow-lg text-sm text-center transition-all flex items-center justify-center gap-2 ${
                isPlacing
                  ? 'bg-amber-500/50 text-slate-950/60 cursor-not-allowed shadow-none'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40'
              }`}
            >
              {isPlacing ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                  Processing Order…
                </>
              ) : (
                <>
                  <span>🎟️</span>
                  <span>Confirm & Generate Pickup Token</span>
                </>
              )}
            </button>

            {/* Back to Cart */}
            <Link
              to="/cart"
              className="block text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
