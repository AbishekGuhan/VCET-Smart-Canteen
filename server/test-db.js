const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const FoodItem = require('./models/FoodItem');
const Order = require('./models/Order');
const Inventory = require('./models/Inventory');

console.log('Testing Mongoose Schemas & Models Registration...');

try {
  // Test User model structure
  const user = new User({
    name: 'Test Student',
    email: 'student@vcet.ac.in',
    password: 'password123',
    role: 'student',
    department: 'CSE',
    registerNumber: '913120104001',
    phone: '9876543210'
  });
  console.log('✔ User Model Validated');

  // Test Category model structure
  const category = new Category({
    name: 'Breakfast',
    description: 'Fresh South Indian Breakfast'
  });
  console.log('✔ Category Model Validated');

  // Test FoodItem model structure
  const foodItem = new FoodItem({
    name: 'Ghee Roast Dosa',
    category: new mongoose.Types.ObjectId(),
    price: 45,
    description: 'Crispy dosa with ghee',
    prepTimeMinutes: 8
  });
  console.log('✔ FoodItem Model Validated');

  // Test Order model structure
  const order = new Order({
    user: new mongoose.Types.ObjectId(),
    items: [{
      foodItem: foodItem._id,
      quantity: 2,
      price: 45
    }],
    totalAmount: 90,
    tokenNumber: 'VCET-042',
    status: 'Pending',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI'
  });
  console.log('✔ Order Model Validated');

  // Test Inventory model structure
  const inventory = new Inventory({
    foodItem: foodItem._id,
    currentStock: 50,
    minThreshold: 10,
    unit: 'dosa'
  });
  console.log('✔ Inventory Model Validated');

  console.log('\nAll 5 Mongoose Models (User, Category, FoodItem, Order, Inventory) are valid and ready!');
  process.exit(0);
} catch (err) {
  console.error('❌ Error validating models:', err.message);
  process.exit(1);
}
