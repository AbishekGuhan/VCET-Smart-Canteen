/**
 * Task 8 — Admin Dashboard Verification Tests
 */

const { getAdminDashboardStats } = require('./controllers/adminController');
const { authorize } = require('./middleware/authMiddleware');
const Order = require('./models/Order');
const FoodItem = require('./models/FoodItem');
const Inventory = require('./models/Inventory');

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.data = null;
  res.status = function (code) { this.statusCode = code; return this; };
  res.json = function (data) { this.data = data; return this; };
  return res;
}

async function runAdminTests() {
  console.log('Starting Task 8 Admin Dashboard Backend Verification...\n');
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

  // ── TEST 1: Role Authorization for STUDENT ──────────────────────────────────
  console.log('Test 1: Check access with STUDENT role');
  const adminAuth = authorize('ADMIN');
  const reqStudent = { user: { _id: '123', role: 'STUDENT' } };
  const resStudent = mockRes();
  adminAuth(reqStudent, resStudent, () => {
    resStudent.status(200).json({ ok: true });
  });
  check('STUDENT role blocked with 403 Forbidden', resStudent.statusCode === 403, resStudent.statusCode);

  // ── TEST 2: Role Authorization for STAFF ───────────────────────────────────
  console.log('\nTest 2: Check access with STAFF role');
  const reqStaff = { user: { _id: '456', role: 'STAFF' } };
  const resStaff = mockRes();
  adminAuth(reqStaff, resStaff, () => {
    resStaff.status(200).json({ ok: true });
  });
  check('STAFF role blocked with 403 Forbidden', resStaff.statusCode === 403, resStaff.statusCode);

  // ── TEST 3: Role Authorization for ADMIN ───────────────────────────────────
  console.log('\nTest 3: Check access with ADMIN role');
  const reqAdmin = { user: { _id: '789', role: 'ADMIN' } };
  const resAdmin = mockRes();
  let nextCalled = false;
  adminAuth(reqAdmin, resAdmin, () => {
    nextCalled = true;
  });
  check('ADMIN role granted access (next called)', nextCalled);

  // ── TEST 4: Stats Calculation from Mock Database Queries ───────────────────
  console.log('\nTest 4: Stats retrieval and calculations from models');
  // Mock model methods
  Order.countDocuments = async (query) => {
    if (!query) return 15; // totalOrders
    if (query.createdAt) return 4; // todayOrders
    if (query.orderStatus && Array.isArray(query.orderStatus.$in)) return 3; // pendingOrders
    if (query.orderStatus === 'COMPLETED') return 10; // completedOrders
    return 0;
  };

  Order.aggregate = async (pipeline) => {
    return [{ _id: null, total: 3450.5 }];
  };

  FoodItem.countDocuments = async (query) => {
    if (query && query.isAvailable === true) return 18;
    return 20;
  };

  Inventory.countDocuments = async (query) => {
    return 2; // lowStockItems
  };

  const resStats = mockRes();
  await getAdminDashboardStats(reqAdmin, resStats);

  check('Dashboard returns 200 OK', resStats.statusCode === 200, resStats.statusCode);
  if (resStats.statusCode === 200) {
    const stats = resStats.data;
    check('totalOrders = 15', stats.totalOrders === 15, stats.totalOrders);
    check('todayOrders = 4', stats.todayOrders === 4, stats.todayOrders);
    check('pendingOrders = 3', stats.pendingOrders === 3, stats.pendingOrders);
    check('completedOrders = 10', stats.completedOrders === 10, stats.completedOrders);
    check('totalSales = 3450.5', stats.totalSales === 3450.5, stats.totalSales);
    check('availableFood = 18', stats.availableFood === 18, stats.availableFood);
    check('lowStockItems = 2', stats.lowStockItems === 2, stats.lowStockItems);
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Results: ${pass} passed, ${fail} failed`);
  console.log('══════════════════════════════════════════════════════\n');

  process.exit(fail === 0 ? 0 : 1);
}

runAdminTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
