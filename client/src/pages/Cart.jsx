import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    subtotal,
    total,
    totalItemsCount,
  } = useCart();
  const { isAuthenticated } = useAuth();

  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-10 shadow-xl max-w-lg mx-auto">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Your Cart is Empty</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            You haven't added any VCET canteen food items to your cart yet. Explore our delicious menu to pre-order snacks & meals!
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>🛒</span> Your Shopping Cart
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected for cafeteria pickup
          </p>
        </div>
        <button
          onClick={clearCart}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 hover:border-red-500/40 transition-all"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const categoryName = typeof item.category === 'object' ? item.category?.name : item.category;
            const itemSubtotal = item.price * item.quantity;

            return (
              <div
                key={item._id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-slate-700 transition-all"
              >
                {/* Food Image & Details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.image || defaultImage}
                    alt={item.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                    onError={(e) => {
                      e.target.src = defaultImage;
                    }}
                  />
                  <div>
                    {categoryName && (
                      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-0.5">
                        {categoryName}
                      </span>
                    )}
                    <h3 className="font-bold text-white text-base leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Unit Price: <span className="text-amber-400 font-semibold">₹{item.price}</span>
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Item Subtotal */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-900">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => decreaseQuantity(item._id)}
                      className="h-7 w-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs transition-colors"
                      title="Decrease Quantity"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item._id)}
                      className="h-7 w-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs transition-colors"
                      title="Increase Quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right min-w-[70px]">
                    <span className="block text-[10px] text-slate-500 font-medium uppercase">
                      Subtotal
                    </span>
                    <span className="text-base font-extrabold text-amber-400">
                      ₹{itemSubtotal}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/30 transition-all text-xs"
                    title="Remove Item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <span>💡</span>
            <span>Cart prices shown above are for display. Order total will be re-calculated securely from database during checkout.</span>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-6 sticky top-24">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span>📋</span> Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal ({totalItemsCount})</span>
                <span className="font-semibold text-slate-200">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Campus Service Fee</span>
                <span className="font-semibold text-emerald-400">FREE (₹0)</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="font-bold text-white text-base">Estimated Total</span>
                <span className="font-extrabold text-amber-400 text-2xl">₹{total}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <Link
                to="/checkout"
                id="checkout-btn"
                className="block w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm text-center"
              >
                Proceed to Checkout &rarr;
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm text-center"
                >
                  Login to Checkout &rarr;
                </Link>
                <p className="text-center text-xs text-slate-500">You must be logged in to place an order.</p>
              </div>
            )}

            <Link
              to="/menu"
              className="block text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
