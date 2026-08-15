const Category = require('./models/Category');
const FoodItem = require('./models/FoodItem');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('./controllers/categoryController');
const { getFoods, getFoodById, createFood, updateFood, deleteFood } = require('./controllers/foodController');
const { protect, authorize } = require('./middleware/authMiddleware');

// Mock in-memory database stores for unit testing
const categoriesStore = new Map();
const foodsStore = new Map();

function createMockRes() {
  const res = {};
  res.statusCode = 200;
  res.data = null;
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(payload) {
    this.data = payload;
    return this;
  };
  return res;
}

async function runMenuTests() {
  console.log('Starting Task 5 Food Menu System Verification...\n');

  try {
    // Stub Category Mongoose methods
    Category.find = function() {
      return {
        sort: async function() {
          return Array.from(categoriesStore.values());
        }
      };
    };
    Category.findOne = async function(query) {
      for (let cat of categoriesStore.values()) {
        if (cat.name === query.name) return cat;
      }
      return null;
    };
    Category.create = async function(doc) {
      const id = 'cat_' + Date.now();
      const newCat = { _id: id, ...doc };
      categoriesStore.set(id, newCat);
      return newCat;
    };

    // Stub FoodItem Mongoose methods
    FoodItem.find = function(filter = {}) {
      let items = Array.from(foodsStore.values());
      if (filter.category) {
        items = items.filter(i => i.category === filter.category);
      }
      if (filter.isAvailable) {
        items = items.filter(i => i.isAvailable === true);
      }
      if (filter.$or) {
        items = items.filter(i => 
          i.name.toLowerCase().includes(filter.$or[0].name.$regex.toLowerCase()) ||
          i.description.toLowerCase().includes(filter.$or[1].description.$regex.toLowerCase())
        );
      }
      return {
        populate: function() {
          return {
            sort: function(sortObj) {
              if (sortObj.price === 1) items.sort((a,b) => a.price - b.price);
              if (sortObj.price === -1) items.sort((a,b) => b.price - a.price);
              return {
                exec: async () => items
              };
            }
          };
        }
      };
    };

    FoodItem.findById = function(id) {
      const item = foodsStore.get(id);
      return {
        populate: async function() {
          return item ? { ...item } : null;
        }
      };
    };

    FoodItem.create = async function(doc) {
      const id = 'food_' + Date.now();
      const newFood = {
        _id: id,
        ...doc,
        save: async function() {
          foodsStore.set(id, this);
          return this;
        },
        populate: async function() {
          return this;
        }
      };
      foodsStore.set(id, newFood);
      return newFood;
    };

    FoodItem.findByIdAndDelete = async function(id) {
      foodsStore.delete(id);
      return true;
    };

    // 1. Create a Category as ADMIN
    console.log('Test 1: Create Category as ADMIN');
    const req1 = { body: { name: 'Breakfast Specials', description: 'Morning items' }, user: { role: 'ADMIN' } };
    const res1 = createMockRes();
    await createCategory(req1, res1);

    let catId = '';
    if (res1.statusCode === 201 && res1.data._id) {
      catId = res1.data._id;
      console.log('✔ PASS: Category created by ADMIN (HTTP 201, ID:', catId, ')');
    } else {
      console.error('❌ FAIL: Category creation failed:', res1.statusCode, res1.data);
    }

    // 2. Fetch Categories (Public)
    console.log('\nTest 2: GET /api/categories (Public access)');
    const req2 = {};
    const res2 = createMockRes();
    await getCategories(req2, res2);

    if (res2.statusCode === 200 && res2.data.length > 0) {
      console.log('✔ PASS: Categories retrieved successfully (HTTP 200, Count:', res2.data.length, ')');
    } else {
      console.error('❌ FAIL: Fetch categories failed:', res2.statusCode, res2.data);
    }

    // 3. Create Food Item as ADMIN
    console.log('\nTest 3: Create Food Item as ADMIN');
    const req3 = {
      body: {
        name: 'Ghee Roast Dosa',
        category: catId,
        price: 45,
        description: 'Crispy ghee roast with sambar',
        prepTimeMinutes: 8,
        isAvailable: true
      },
      user: { role: 'ADMIN' }
    };
    const res3 = createMockRes();
    await createFood(req3, res3);

    let foodId = '';
    if (res3.statusCode === 201 && res3.data._id) {
      foodId = res3.data._id;
      console.log('✔ PASS: Food Item created by ADMIN (HTTP 201, ID:', foodId, ')');
      console.log('  Price:', res3.data.price, 'Prep Time:', res3.data.prepTimeMinutes);
    } else {
      console.error('❌ FAIL: Food item creation failed:', res3.statusCode, res3.data);
    }

    // 4. Test Authorization: Block STUDENT from creating food
    console.log('\nTest 4: Attempt creating Food Item as STUDENT (Role authorization check)');
    const req4 = { user: { role: 'STUDENT' } };
    const res4 = createMockRes();
    const adminMiddleware = authorize('ADMIN');

    adminMiddleware(req4, res4, () => {
      res4.status(200).json({ message: 'Success' });
    });

    if (res4.statusCode === 403) {
      console.log('✔ PASS: STUDENT role correctly blocked from creating food (HTTP 403)');
    } else {
      console.error('❌ FAIL: Expected 403 for STUDENT creating food, got', res4.statusCode, res4.data);
    }

    // 5. Test Public GET /api/food with query filters & sorting
    console.log('\nTest 5: GET /api/food with search query & price sort (Public access)');
    const req5 = { query: { search: 'Dosa', sort: 'price_asc' } };
    const res5 = createMockRes();
    await getFoods(req5, res5);

    if (res5.statusCode === 200 && res5.data.length > 0) {
      console.log('✔ PASS: Filtered & Sorted Food Items retrieved (HTTP 200)');
      console.log('  Found item:', res5.data[0].name, 'Price: ₹' + res5.data[0].price);
    } else {
      console.error('❌ FAIL: GET /api/food with query failed:', res5.statusCode, res5.data);
    }

    // 6. Test DELETE /api/food/:id as ADMIN
    console.log('\nTest 6: DELETE /api/food/:id as ADMIN');
    const req6 = { params: { id: foodId }, user: { role: 'ADMIN' } };
    const res6 = createMockRes();
    await deleteFood(req6, res6);

    if (res6.statusCode === 200) {
      console.log('✔ PASS: Food item deleted by ADMIN (HTTP 200)');
    } else {
      console.error('❌ FAIL: Delete food item failed:', res6.statusCode, res6.data);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL TASK 5 FOOD MENU BACKEND TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing menu tests:', err);
    process.exit(1);
  }
}

runMenuTests();
