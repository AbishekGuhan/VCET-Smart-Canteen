/**
 * Task 9 — Backend Inventory & Sales Verification Tests
 */

const {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
} = require('./controllers/inventoryController');
const { getAdminSalesAnalytics } = require('./controllers/adminController');
const { authorize } = require('./middleware/authMiddleware');
const Inventory = require('./models/Inventory');
const FoodItem = require('./models/FoodItem');
const Order = require('./models/Order');
const mongoose = require('mongoose');

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.data = null;
  res.status = function (code) { this.statusCode = code; return this; };
  res.json = function (data) { this.data = data; return this; };
  return res;
}

async function runTask9Tests() {
  console.log('Starting Task 9 Inventory & Sales Backend Verification...\n');
  let pass = 0;
  let fail = 0;

  function check(label, condition, got) {
    if (condition) {
      console.log(`  ✔ PASS: ${label}`);
      pass++;
    } else {
      console.error(`  ❌ FAIL: ${label}`, got !== undefined ? `| got: ${JSON.stringify(got)}` : '');
      fail++;
    }
  }

  // ── 1. AUTHORIZATION TESTS ──────────────────────────────────────────────────
  console.log('Test 1: Check Inventory & Sales Route Protection for Non-Admins');
  const adminAuth = authorize('ADMIN');
  const reqStudent = { user: { _id: '123', role: 'STUDENT' } };
  const reqStaff = { user: { _id: '456', role: 'STAFF' } };
  const reqAdmin = { user: { _id: '789', role: 'ADMIN' } };

  const resStudent = mockRes();
  adminAuth(reqStudent, resStudent, () => { resStudent.status(200).json({ ok: true }); });
  check('STUDENT role rejected with 403 Forbidden', resStudent.statusCode === 403, resStudent.statusCode);

  const resStaff = mockRes();
  adminAuth(reqStaff, resStaff, () => { resStaff.status(200).json({ ok: true }); });
  check('STAFF role rejected with 403 Forbidden', resStaff.statusCode === 403, resStaff.statusCode);

  let adminAllowed = false;
  const resAdmin = mockRes();
  adminAuth(reqAdmin, resAdmin, () => { adminAllowed = true; });
  check('ADMIN role granted access', adminAllowed);

  // ── 2. INVENTORY CRUD & LOW-STOCK DETECTION ────────────────────────────────
  console.log('\nTest 2: Inventory CRUD & Low-Stock Filtering');
  const foodId1 = new mongoose.Types.ObjectId();
  const foodId2 = new mongoose.Types.ObjectId();
  const invId1 = new mongoose.Types.ObjectId();
  const invId2 = new mongoose.Types.ObjectId();

  const inventoryStore = new Map();
  const foodStore = new Map();

  foodStore.set(foodId1.toString(), { _id: foodId1, name: 'Parotta', price: 30, isAvailable: true });
  foodStore.set(foodId2.toString(), { _id: foodId2, name: 'Veg Biryani', price: 70, isAvailable: true });

  inventoryStore.set(invId1.toString(), {
    _id: invId1,
    foodItem: foodId1,
    currentStock: 5,
    minThreshold: 10,
    unit: 'pieces',
    lastRestocked: new Date(),
  });

  inventoryStore.set(invId2.toString(), {
    _id: invId2,
    foodItem: foodId2,
    currentStock: 25,
    minThreshold: 10,
    unit: 'plates',
    lastRestocked: new Date(),
  });

  // Monkey-patch FoodItem
  FoodItem.findById = async (id) => foodStore.get(id.toString()) || null;

  // Monkey-patch Inventory
  Inventory.find = (filter) => ({
    populate: () => ({
      sort: async () => {
        let items = Array.from(inventoryStore.values());
        if (filter && filter.$expr) {
          items = items.filter((i) => i.currentStock <= i.minThreshold);
        }
        return items.map((i) => ({
          ...i,
          foodItem: foodStore.get(i.foodItem.toString()),
        }));
      },
    }),
  });

  Inventory.findById = (id) => {
    const item = inventoryStore.get(id.toString());
    if (!item) {
      return null;
    }
    const doc = {
      ...item,
      save: async function () {
        inventoryStore.set(this._id.toString(), { ...this });
        return this;
      },
      populate: async function () {
        return {
          ...this,
          foodItem: foodStore.get(this.foodItem.toString()),
        };
      },
    };
    return doc;
  };

  Inventory.findOne = async (query) => {
    if (query.foodItem) {
      for (let inv of inventoryStore.values()) {
        if (inv.foodItem.toString() === query.foodItem.toString()) return inv;
      }
    }
    return null;
  };

  Inventory.create = async (doc) => {
    const id = new mongoose.Types.ObjectId();
    const created = { _id: id, ...doc };
    inventoryStore.set(id.toString(), created);
    return {
      ...created,
      populate: async () => ({
        ...created,
        foodItem: foodStore.get(doc.foodItem.toString()),
      }),
    };
  };

  Inventory.findByIdAndDelete = async (id) => {
    inventoryStore.delete(id.toString());
    return true;
  };

  // Test 2.1: Get All Inventory
  const resGetAll = mockRes();
  await getInventory({ query: {} }, resGetAll);
  check('GET /api/inventory returns 2 items', resGetAll.statusCode === 200 && resGetAll.data.length === 2, resGetAll.data?.length);

  // Test 2.2: Low-Stock Filter
  const resLowStock = mockRes();
  await getInventory({ query: { lowStockOnly: 'true' } }, resLowStock);
  check('GET /api/inventory?lowStockOnly=true returns only items <= minThreshold', resLowStock.statusCode === 200 && resLowStock.data.length === 1, resLowStock.data?.length);
  check('Low-stock item detected is Parotta (stock: 5 <= threshold: 10)', resLowStock.data[0]?.foodItem?.name === 'Parotta');

  // Test 2.3: Restock/Update Inventory
  const resUpdate = mockRes();
  await updateInventory({ params: { id: invId1.toString() }, body: { restockQuantity: 20 } }, resUpdate);
  check('PUT /api/inventory/:id adds restockQuantity to currentStock', resUpdate.statusCode === 200 && resUpdate.data.currentStock === 25, resUpdate.data?.currentStock);

  // Test 2.4: Delete Inventory
  const resDelete = mockRes();
  await deleteInventory({ params: { id: invId2.toString() } }, resDelete);
  check('DELETE /api/inventory/:id removes record', resDelete.statusCode === 200 && inventoryStore.size === 1, inventoryStore.size);

  // ── 3. SALES ANALYTICS AGGREGATION ─────────────────────────────────────────
  console.log('\nTest 3: Sales Analytics Aggregations');
  Order.aggregate = async (pipeline) => {
    // Check if grouping by date, most ordered, or overall
    const isSalesByDate = pipeline.some((stage) => stage.$group && stage.$group._id && stage.$group._id.$dateToString);
    const isMostOrdered = pipeline.some((stage) => stage.$unwind);
    const isToday = pipeline.some((stage) => stage.$match && stage.$match.createdAt);

    if (isSalesByDate) {
      return [
        { date: '2026-08-15', revenue: 1540, orderCount: 12 },
        { date: '2026-08-14', revenue: 2320, orderCount: 18 },
      ];
    }
    if (isMostOrdered) {
      return [
        { name: 'Masala Dosa', totalQuantity: 45, totalRevenue: 2025 },
        { name: 'Filter Coffee', totalQuantity: 38, totalRevenue: 760 },
      ];
    }
    if (isToday) {
      return [{ todaySales: 1540, todayOrders: 12 }];
    }
    return [{ totalSales: 7850, totalOrders: 65, completedOrders: 58 }];
  };

  const resSales = mockRes();
  await getAdminSalesAnalytics(reqAdmin, resSales);

  check('GET /api/admin/sales returns 200 OK', resSales.statusCode === 200, resSales.statusCode);
  if (resSales.statusCode === 200) {
    const s = resSales.data;
    check('totalSales aggregated correctly', s.totalSales === 7850, s.totalSales);
    check('todaySales aggregated correctly', s.todaySales === 1540, s.todaySales);
    check('completedOrders count present', s.completedOrders === 58, s.completedOrders);
    check('mostOrderedFood returns top item Masala Dosa', s.mostOrderedFood[0]?.name === 'Masala Dosa', s.mostOrderedFood);
    check('salesByDate returns grouped timeline records', s.salesByDate.length === 2 && s.salesByDate[0].revenue === 1540, s.salesByDate);
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Task 9 Backend Results: ${pass} passed, ${fail} failed`);
  console.log('══════════════════════════════════════════════════════\n');

  process.exit(fail === 0 ? 0 : 1);
}

runTask9Tests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
