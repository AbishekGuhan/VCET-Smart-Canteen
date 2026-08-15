const mongoose = require('mongoose');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
require('dotenv').config();

const sampleCategories = [
  { name: 'South Indian Breakfast', description: 'Freshly prepared morning South Indian specialties' },
  { name: 'Lunch & Thali Meals', description: 'Wholesome rice meals & combo dishes' },
  { name: 'Snacks & Quick Bites', description: 'Crispy evening snacks and savories' },
  { name: 'Hot & Cold Beverages', description: 'Madurai style filter coffee, tea & cool drinks' }
];

const sampleFoodItems = [
  {
    name: 'Ghee Roast Dosa',
    categoryName: 'South Indian Breakfast',
    price: 45,
    description: 'Golden crispy crepe cooked with pure ghee, served with coconut chutney & sambar.',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    prepTimeMinutes: 8
  },
  {
    name: 'Steamed Idli (2 Pcs)',
    categoryName: 'South Indian Breakfast',
    price: 25,
    description: 'Soft steamed rice cakes served with tomato chutney, coconut chutney & hot sambar.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    prepTimeMinutes: 5
  },
  {
    name: 'Crispy Medu Vada (1 Pc)',
    categoryName: 'South Indian Breakfast',
    price: 15,
    description: 'Deep-fried savory lentil doughnut with crunchy crust and soft interior.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    prepTimeMinutes: 5
  },
  {
    name: 'Poori Masala (2 Pcs)',
    categoryName: 'South Indian Breakfast',
    price: 40,
    description: 'Fluffy golden fried pooris served with flavorful potato potato masala.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    prepTimeMinutes: 10
  },
  {
    name: 'South Indian Special Veg Meals',
    categoryName: 'Lunch & Thali Meals',
    price: 70,
    description: 'Steamed ponni rice served with sambar, rasam, kootu, poriyal, buttermilk & appalam.',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    prepTimeMinutes: 12
  },
  {
    name: 'Chicken Biryani Combo',
    categoryName: 'Lunch & Thali Meals',
    price: 120,
    description: 'Fragrant seeraga samba rice biryani served with onion raita & boiled egg.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    prepTimeMinutes: 10
  },
  {
    name: 'Hot Samosa (2 Pcs)',
    categoryName: 'Snacks & Quick Bites',
    price: 20,
    description: 'Crispy pastry stuffed with spiced potato & green peas filling.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    prepTimeMinutes: 4
  },
  {
    name: 'Madurai Filter Coffee',
    categoryName: 'Hot & Cold Beverages',
    price: 15,
    description: 'Authentic frothy South Indian chicory filter coffee brewed with fresh milk.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    prepTimeMinutes: 3
  },
  {
    name: 'Special Masala Tea',
    categoryName: 'Hot & Cold Beverages',
    price: 12,
    description: 'Steaming hot tea infused with cardamom, ginger, and spices.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    prepTimeMinutes: 3
  }
];

async function seedData() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vcet_canteen';
    await mongoose.connect(mongoURI);
    console.log('[VCET Seed] Connected to MongoDB...');

    // Clear existing sample categories & food items
    await Category.deleteMany({});
    await FoodItem.deleteMany({});
    console.log('[VCET Seed] Cleared existing menu data.');

    // Seed categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`[VCET Seed] Seeded ${createdCategories.length} categories.`);

    // Map category name to ObjectId
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Seed food items
    const foodDocs = sampleFoodItems.map((item) => ({
      name: item.name,
      category: categoryMap[item.categoryName],
      price: item.price,
      description: item.description,
      image: item.image,
      isAvailable: item.isAvailable,
      prepTimeMinutes: item.prepTimeMinutes,
    }));

    const createdFoods = await FoodItem.insertMany(foodDocs);
    console.log(`[VCET Seed] Seeded ${createdFoods.length} food items.`);

    console.log('[VCET Seed] Sample VCET Canteen Menu seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[VCET Seed] Error seeding menu data:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = seedData;
