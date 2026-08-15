import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const FoodCard = ({ food, onViewDetails, onEdit, onDelete, isAdmin }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  const { addToCart } = useCart();
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const isItemAvailable = food.isAvailable !== false;

  const handleAddToCart = () => {
    const result = addToCart(food);
    if (result.success) {
      setFeedbackMsg('Added! 🛒');
      setTimeout(() => setFeedbackMsg(''), 1500);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group">
      <div>
        {/* Card Image Banner */}
        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
          <img
            src={food.image || defaultImage}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur border border-slate-800 text-amber-400 text-[11px] font-bold">
              {food.category?.name || 'Canteen Special'}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur ${
                isItemAvailable
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {isItemAvailable ? 'In Stock' : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-amber-400 transition-colors">
              {food.name}
            </h3>
            <span className="font-extrabold text-amber-400 text-lg whitespace-nowrap">
              ₹{food.price}
            </span>
          </div>

          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
            {food.description || 'Freshly prepared item in VCET cafeteria.'}
          </p>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              ⏱️ {food.prepTimeMinutes || 10} mins prep
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 pt-0 border-t border-slate-900/60 mt-2">
        <div className="flex items-center gap-2 pt-3">
          <button
            onClick={() => onViewDetails(food)}
            className="py-2 px-3 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-all text-center border border-slate-800"
          >
            Details
          </button>

          <button
            onClick={handleAddToCart}
            disabled={!isItemAvailable}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all text-center shadow-md ${
              isItemAvailable
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            {feedbackMsg || (isItemAvailable ? 'Add to Cart 🛒' : 'Unavailable')}
          </button>

          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(food)}
                className="p-2 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl transition-all"
                title="Edit Food Item"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(food._id)}
                className="p-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all"
                title="Delete Food Item"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
