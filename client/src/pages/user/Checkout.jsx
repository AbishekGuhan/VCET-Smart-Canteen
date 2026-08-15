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

  const [isPlacing, setIsPlacing] = useState(false);
  const [apiError, setApiError] = useState('');

  const defaultImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

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
    if (isPlacing) return; // prevent duplicate submissions

    setApiError('');
    setIsPlacing(true);

    try {
      // createOrder sends only { items: [{ foodItem, quantity }] }
      // Backend calculates all prices — never send price/subtotal/totalAmount
      const data = await createOrder(cartItems);
      const createdOrder = data.order;

      // Clear cart AFTER successful order creation
      clearCart();

      // Navigate to order confirmation with the real order ID from backend
      navigate(`/order-confirmation/${createdOrder._id}`);
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;

      // Map specific server errors to friendly messages
      if (status === 401) {
        setApiError('Your session has expired. Please log in again.');
      } else if (status === 400) {
        // e.g. "inactive food", "unavailable item", "invalid quantity"
        setApiError(serverMsg || 'One or more items in your cart are unavailable. Please review your cart.');
      } else if (status === 404) {
        setApiError(serverMsg || 'A food item in your cart no longer exists. Please update your cart.');
      } else if (!err.response) {
        // Network error — no response at all
        setApiError('Network error — please check your internet connection and try again.');
      } else {
        setApiError('Something went wrong while placing your order. Please try again.');
      }
    } finally {
      setIsPlacing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page Header ── */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🧾</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Checkout
          </h1>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm">
          Review your order and confirm — payment is collected at the canteen counter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Customer Info + Order Items ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Details Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-800">
              <span>👤</span> Customer Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-900">
                <span className="text-slate-400">Name</span>
                <span className="font-semibold text-slate-200">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-900">
                <span className="text-slate-400">Email</span>
                <span className="font-semibold text-slate-200">{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex justify-between py-1.5 border-b border-slate-900">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-semibold text-slate-200">{user.phone}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Role</span>
                <span className="font-semibold text-amber-400 uppercase text-xs">{user?.role}</span>
              </div>
            </div>
          </div>

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

            {/* Security note */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500 flex items-start gap-2">
              <span className="mt-0.5">🔒</span>
              <span>
                Cart prices are estimates only. The final order total is securely calculated from the
                database at the time of order placement.
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Payment + Place Order Sidebar ── */}
        <div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-6 sticky top-24">

            {/* Order Summary */}
            <div>
              <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
                <span>📋</span> Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Items ({totalItemsCount})</span>
                  <span className="font-semibold text-slate-200">₹{total}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Campus Service Fee</span>
                  <span className="font-semibold text-emerald-400">FREE (₹0)</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Estimated Total</span>
                  <span className="font-extrabold text-amber-400 text-2xl">₹{total}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                * Final amount confirmed by the server at order time.
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
                <span>💳</span> Payment Method
              </h2>
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/25 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl shrink-0">
                  🏪
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-400">Cash at Canteen</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Pay in cash directly at the VCET canteen counter when you collect your order.
                    No online payment required.
                  </p>
                </div>
              </div>
              {/* Checkmark confirmation */}
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                <span>✅</span>
                <span>Selected: Cash at Canteen</span>
              </div>
            </div>

            {/* Error Message */}
            {apiError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed flex items-start gap-2"
              >
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span>{apiError}</span>
              </div>
            )}

            {/* Place Order Button */}
            <button
              id="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isPlacing}
              className={`w-full py-3.5 px-4 font-bold rounded-xl shadow-lg text-sm text-center transition-all flex items-center justify-center gap-2 ${
                isPlacing
                  ? 'bg-amber-500/50 text-slate-950/60 cursor-not-allowed shadow-none'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40'
              }`}
            >
              {isPlacing ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                  Placing Order…
                </>
              ) : (
                <>
                  <span>🎟️</span>
                  Place Order
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
