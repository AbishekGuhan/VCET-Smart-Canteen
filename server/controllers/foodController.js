const FoodItem = require('../models/FoodItem');

// @desc    Get all food items (supports filter, search, sort)
// @route   GET /api/food
// @access  Public
const getFoods = async (req, res) => {
  try {
    const { category, search, availableOnly, sort } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (availableOnly === 'true') {
      filter.isAvailable = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let query = FoodItem.find(filter).populate('category', 'name description');

    // Sorting logic
    if (sort === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const foods = await query.exec();
    return res.status(200).json(foods);
  } catch (error) {
    console.error('Error fetching food items:', error.message);
    return res.status(500).json({ message: 'Failed to fetch food items', error: error.message });
  }
};

// @desc    Get single food item by ID
// @route   GET /api/food/:id
// @access  Public
const getFoodById = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id).populate('category', 'name description');
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    return res.status(200).json(food);
  } catch (error) {
    console.error('Error fetching food item:', error.message);
    return res.status(500).json({ message: 'Failed to fetch food item', error: error.message });
  }
};

// @desc    Create a food item
// @route   POST /api/food
// @access  Private/Admin
const createFood = async (req, res) => {
  try {
    const { name, category, price, description, image, isAvailable, prepTimeMinutes } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    const food = await FoodItem.create({
      name: name.trim(),
      category,
      price: Number(price),
      description: description || '',
      image: image || '',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : 10,
    });

    const populatedFood = await food.populate('category', 'name description');
    return res.status(201).json(populatedFood);
  } catch (error) {
    console.error('Error creating food item:', error.message);
    return res.status(500).json({ message: 'Failed to create food item', error: error.message });
  }
};

// @desc    Update a food item
// @route   PUT /api/food/:id
// @access  Private/Admin
const updateFood = async (req, res) => {
  try {
    const { name, category, price, description, image, isAvailable, prepTimeMinutes } = req.body;
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (name !== undefined) food.name = name.trim();
    if (category !== undefined) food.category = category;
    if (price !== undefined) food.price = Number(price);
    if (description !== undefined) food.description = description;
    if (image !== undefined) food.image = image;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;
    if (prepTimeMinutes !== undefined) food.prepTimeMinutes = Number(prepTimeMinutes);

    const updatedFood = await food.save();
    const populatedFood = await updatedFood.populate('category', 'name description');
    return res.status(200).json(populatedFood);
  } catch (error) {
    console.error('Error updating food item:', error.message);
    return res.status(500).json({ message: 'Failed to update food item', error: error.message });
  }
};

// @desc    Delete a food item
// @route   DELETE /api/food/:id
// @access  Private/Admin
const deleteFood = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    await FoodItem.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Error deleting food item:', error.message);
    return res.status(500).json({ message: 'Failed to delete food item', error: error.message });
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
};
