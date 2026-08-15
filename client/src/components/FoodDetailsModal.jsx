import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const FoodDetailsModal = ({ food, onClose }) => {
  if (!food) return null;

  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  const { addToCart } = useCart();
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const isItemAvailable = food.isAvailable !== false;

  const handleAddToCart = () => {
    const result = addToCart(food);
    if (result.success) {
      setFeedbackMsg('Added to Cart! 🛒');
      setTimeout(() => setFeedbackMsg(''), 1500);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all"
        >
          ✕
        </button>

        {/* Header Image */}
        <div className="h-56 w-full bg-slate-900 relative">
          <img
            src={food.image || defaultImage}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
                {food.category?.name || 'Category'}
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1 leading-tight">
                {food.name}
              </h2>
            </div>
            <span className="text-2xl font-extrabold text-amber-400">
              ₹{food.price}
            </span>
          </div>
        </div>

        {/* Modal Details Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {food.description || 'No description available.'}
            </p>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Preparation Time
              </span>
              <span className="text-sm font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                ⏱️ {food.prepTimeMinutes || 10} Minutes
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Availability Status
              </span>
              <span
                className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border mt-1 ${
                  isItemAvailable
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {isItemAvailable ? 'In Stock' : 'Currently Unavailable'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!isItemAvailable}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
              isItemAvailable
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            {feedbackMsg || (isItemAvailable ? 'Add to Cart 🛒' : 'Unavailable')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailsModal;
