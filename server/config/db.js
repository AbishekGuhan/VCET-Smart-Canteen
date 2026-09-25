const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let memoryServer = null;

const seedInitialDataIfEmpty = async () => {
  try {
    const User = require('../models/User');
    const Category = require('../models/Category');
    const FoodItem = require('../models/FoodItem');

    // 1. Seed Admin if not exists
    const adminExists = await User.findOne({ email: 'vcetadmin@vcet.edu' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@1234', salt);
      await User.create({
        name: 'VCET Canteen Admin',
        email: 'vcetadmin@vcet.edu',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Canteen Management',
        phone: '9994994991',
      });
      console.log('[VCET DB] Default Admin account created (vcetadmin@vcet.edu / Admin@1234)');
    }

    // 2. Seed Menu if categories are empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const sampleCategories = [
        { name: 'South Indian Breakfast', description: 'Freshly prepared morning South Indian specialties' },
        { name: 'Lunch & Thali Meals', description: 'Wholesome rice meals & combo dishes' },
        { name: 'Snacks & Quick Bites', description: 'Crispy evening snacks and savories' },
        { name: 'Hot & Cold Beverages', description: 'Madurai style filter coffee, tea & cool drinks' }
      ];
      const createdCategories = await Category.insertMany(sampleCategories);
      const categoryMap = {};
      createdCategories.forEach((cat) => {
        categoryMap[cat.name] = cat._id;
      });

      const sampleFoodItems = [
        {
          name: 'Ghee Roast Dosa',
          category: categoryMap['South Indian Breakfast'],
          price: 45,
          description: 'Golden crispy crepe cooked with pure ghee, served with coconut chutney & sambar.',
          image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
          isAvailable: true,
          prepTimeMinutes: 8
        },
        {
          name: 'Steamed Idli (2 Pcs)',
          category: categoryMap['South Indian Breakfast'],
          price: 25,
          description: 'Soft steamed rice cakes served with tomato chutney, coconut chutney & hot sambar.',
          image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
          isAvailable: true,
          prepTimeMinutes: 5
        },
        {
          name: 'Crispy Medu Vada (1 Pc)',
          category: categoryMap['South Indian Breakfast'],
          price: 15,
          description: 'Deep-fried savory lentil doughnut with crunchy crust and soft interior.',
          image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
          isAvailable: true,
          prepTimeMinutes: 5
        },
        {
          name: 'Poori Masala (2 Pcs)',
          category: categoryMap['South Indian Breakfast'],
          price: 40,
          description: 'Fluffy golden fried pooris served with flavorful potato potato masala.',
          image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
          isAvailable: true,
          prepTimeMinutes: 10
        },
        {
          name: 'South Indian Special Veg Meals',
          category: categoryMap['Lunch & Thali Meals'],
          price: 70,
          description: 'Steamed ponni rice served with sambar, rasam, kootu, poriyal, buttermilk & appalam.',
          image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
          isAvailable: true,
          prepTimeMinutes: 12
        },
        {
          name: 'Chicken Biryani Combo',
          category: categoryMap['Lunch & Thali Meals'],
          price: 120,
          description: 'Fragrant seeraga samba rice biryani served with onion raita & boiled egg.',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
          isAvailable: true,
          prepTimeMinutes: 10
        },
        {
          name: 'Hot Samosa (2 Pcs)',
          category: categoryMap['Snacks & Quick Bites'],
          price: 20,
          description: 'Crispy pastry stuffed with spiced potato & green peas filling.',
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
          isAvailable: true,
          prepTimeMinutes: 4
        },
        {
          name: 'Madurai Filter Coffee',
          category: categoryMap['Hot & Cold Beverages'],
          price: 15,
          description: 'Authentic frothy South Indian chicory filter coffee brewed with fresh milk.',
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
          isAvailable: true,
          prepTimeMinutes: 3
        },
        {
          name: 'Special Masala Tea',
          category: categoryMap['Hot & Cold Beverages'],
          price: 12,
          description: 'Steaming hot tea infused with cardamom, ginger, and spices.',
          image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
          isAvailable: true,
          prepTimeMinutes: 3
        }
      ];

      await FoodItem.insertMany(sampleFoodItems);
      console.log('[VCET DB] Default Canteen Menu items seeded successfully.');
    }
  } catch (err) {
    console.warn('[VCET DB] Notice during auto-seeding:', err.message);
  }
};

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (mongoURI) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[VCET Canteen DB] MongoDB Connected: ${conn.connection.host}`);
      await seedInitialDataIfEmpty();
      return conn;
    } catch (error) {
      console.warn(`[VCET Canteen DB] MongoDB Atlas Connection failed (${error.message}).`);
      console.log('[VCET Canteen DB] Falling back to In-Memory MongoDB for instant zero-downtime execution...');
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[VCET Canteen DB] Connected to In-Memory MongoDB at: ${memUri}`);
    await seedInitialDataIfEmpty();
    return conn;
  } catch (memError) {
    console.error(`[VCET Canteen DB] Fatal DB Error: ${memError.message}`);
    return null;
  }
};

module.exports = connectDB;

