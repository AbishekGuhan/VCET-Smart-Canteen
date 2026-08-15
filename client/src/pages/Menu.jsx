import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';

const Menu = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Modal states
  const [selectedFood, setSelectedFood] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showFoodFormModal, setShowFoodFormModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Food form state
  const [foodForm, setFoodForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    prepTimeMinutes: '10',
    isAvailable: true,
  });

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Fetch Food Items
  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      if (availableOnly) params.availableOnly = 'true';
      if (sortOption) params.sort = sortOption;

      const res = await axios.get('/api/food', { params });
      setFoods(res.data);
    } catch (err) {
      console.error('Error loading foods:', err);
      setError('Failed to load menu items. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFoods();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchTerm, availableOnly, sortOption]);

  // Admin: Create Category Handler
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      await axios.post('/api/categories', { name: newCatName, description: newCatDesc });
      setNewCatName('');
      setNewCatDesc('');
      setShowAddCategoryModal(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  // Admin: Open Create / Edit Food Modal
  const openFoodForm = (foodToEdit = null) => {
    if (foodToEdit) {
      setEditingFood(foodToEdit);
      setFoodForm({
        name: foodToEdit.name || '',
        category: foodToEdit.category?._id || foodToEdit.category || '',
        price: foodToEdit.price || '',
        description: foodToEdit.description || '',
        image: foodToEdit.image || '',
        prepTimeMinutes: foodToEdit.prepTimeMinutes || '10',
        isAvailable: foodToEdit.isAvailable !== undefined ? foodToEdit.isAvailable : true,
      });
    } else {
      setEditingFood(null);
      setFoodForm({
        name: '',
        category: categories.length > 0 ? categories[0]._id : '',
        price: '',
        description: '',
        image: '',
        prepTimeMinutes: '10',
        isAvailable: true,
      });
    }
    setShowFoodFormModal(true);
  };

  // Admin: Submit Create / Edit Food Handler
  const handleSaveFood = async (e) => {
    e.preventDefault();
    if (!foodForm.name || !foodForm.category || !foodForm.price) {
      alert('Please enter food name, category, and price.');
      return;
    }

    try {
      if (editingFood) {
        await axios.put(`/api/food/${editingFood._id}`, foodForm);
      } else {
        await axios.post('/api/food', foodForm);
      }
      setShowFoodFormModal(false);
      fetchFoods();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save food item');
    }
  };

  // Admin: Delete Food Handler
  const handleDeleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await axios.delete(`/api/food/${id}`);
      fetchFoods();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete food item');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🍱</span> VCET Cafeteria Menu
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Delicious Campus Menu
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sample food items available at Velammal College of Engineering & Technology, Madurai
          </p>
        </div>

        {/* Admin Action Triggers */}
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>📁</span> + Category
            </button>
            <button
              onClick={() => openFoodForm(null)}
              className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>🍲</span> + Food Item
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by food name or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              🔍
            </span>
          </div>

          {/* Price Sorting */}
          <div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm transition-all"
            >
              <option value="">Sort by Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-slate-300">In Stock Only</span>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === ''
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat._id
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Food Items Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="h-10 w-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-400">Loading VCET Canteen Menu...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold text-center my-8">
          {error}
        </div>
      ) : foods.length === 0 ? (
        <div className="py-16 text-center bg-slate-950 border border-slate-800 rounded-2xl p-8">
          <div className="text-4xl mb-3">🍽️</div>
          <h3 className="text-lg font-bold text-white mb-1">No Food Items Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
            Try adjusting your search criteria or category filter to view other menu items.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setAvailableOnly(false);
              setSortOption('');
            }}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onViewDetails={(item) => setSelectedFood(item)}
              onEdit={(item) => openFoodForm(item)}
              onDelete={(id) => handleDeleteFood(id)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Food Details Modal */}
      {selectedFood && (
        <FoodDetailsModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}

      {/* Admin: Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. South Indian Breakfast"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description of this category..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 h-20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin: Create / Edit Food Item Modal */}
      {showFoodFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
            </h3>

            <form onSubmit={handleSaveFood} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Food Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  placeholder="e.g. Ghee Roast Dosa"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    placeholder="45"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  placeholder="Description of food item..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={foodForm.image}
                    onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Prep Time (Mins)
                  </label>
                  <input
                    type="number"
                    value={foodForm.prepTimeMinutes}
                    onChange={(e) => setFoodForm({ ...foodForm, prepTimeMinutes: e.target.value })}
                    placeholder="10"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={foodForm.isAvailable}
                  onChange={(e) => setFoodForm({ ...foodForm, isAvailable: e.target.checked })}
                  className="h-4 w-4 rounded accent-amber-500"
                />
                <label htmlFor="isAvailable" className="text-xs font-semibold text-slate-300">
                  Mark as Available In Stock
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowFoodFormModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400"
                >
                  {editingFood ? 'Update Food Item' : 'Create Food Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
