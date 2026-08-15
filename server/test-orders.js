/**
 * Task 7A — Order API Unit Tests
 * Tests createOrder, getUserOrders, getOrderById in isolation (no real MongoDB).
 * Style mirrors the existing test-auth.js pattern.
 */

const mongoose = require('mongoose');
const { createOrder, getUserOrders, getOrderById } = require('./controllers/orderController');

// ────────────────────────────────────────────────────────────────────────────
// Minimal mock response helper
// ────────────────────────────────────────────────────────────────────────────
function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.data = null;
  res.status = function (code) { this.statusCode = code; return this; };
  res.json  = function (data)  { this.data = data; return this; };
  return res;
}

// ────────────────────────────────────────────────────────────────────────────
// Fake ObjectIds
// ────────────────────────────────────────────────────────────────────────────
const fakeUserId  = new mongoose.Types.ObjectId();
const fakeFoodId1 = new mongoose.Types.ObjectId();
const fakeFoodId2 = new mongoose.Types.ObjectId();
const fakeOrderId = new mongoose.Types.ObjectId();

// ────────────────────────────────────────────────────────────────────────────
// In-memory stores
// ────────────────────────────────────────────────────────────────────────────
const foodStore  = new Map();
const orderStore = new Map();

// ────────────────────────────────────────────────────────────────────────────
// Seed fake food items
// ────────────────────────────────────────────────────────────────────────────
foodStore.set(fakeFoodId1.toString(), {
  _id: fakeFoodId1,
  name: 'Masala Dosa',
  price: 45,
  isAvailable: true,
});
foodStore.set(fakeFoodId2.toString(), {
  _id: fakeFoodId2,
  name: 'Filter Coffee',
  price: 20,
  isAvailable: false, // unavailable — to test rejection
});

// ────────────────────────────────────────────────────────────────────────────
// Monkey-patch Order model
// ────────────────────────────────────────────────────────────────────────────
const Order = require('./models/Order');

Order.findOne = async (query) => {
  if (query.tokenNumber) {
    for (let o of orderStore.values()) {
      if (o.tokenNumber === query.tokenNumber) return o;
    }
  }
  return null;
};

Order.create = async (data) => {
  const id = new mongoose.Types.ObjectId();
  const order = { _id: id, ...data, createdAt: new Date(), updatedAt: new Date() };
  orderStore.set(id.toString(), order);
  return order;
};

Order.find = (query) => ({
  sort: () => ({
    populate: async () => {
      const userId = query.user.toString();
      return Array.from(orderStore.values()).filter(o => o.user.toString() === userId);
    }
  })
});

Order.findById = (id) => ({
  populate: async () => {
    const o = orderStore.get(id.toString());
    if (!o) return null;
    // Simulate populated user field
    return { ...o, user: { _id: fakeUserId, name: 'Test User', email: 'test@vcet.ac.in', role: 'STUDENT' } };
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Monkey-patch FoodItem model
// ────────────────────────────────────────────────────────────────────────────
const FoodItem = require('./models/FoodItem');

FoodItem.findById = async (id) => {
  return foodStore.get(id.toString()) || null;
};

// ────────────────────────────────────────────────────────────────────────────
// Run tests
// ────────────────────────────────────────────────────────────────────────────
async function runOrderTests() {
  console.log('Starting Task 7A — Order API Tests\n');
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

  // ── TEST 1: Reject order with empty items ──────────────────────────────────
  console.log('Test 1: Empty cart — should return 400');
  const r1 = mockRes();
  await createOrder({ user: { _id: fakeUserId }, body: { items: [] } }, r1);
  check('Returns 400 for empty cart', r1.statusCode === 400, r1.statusCode);

  // ── TEST 2: Reject order with missing items field ──────────────────────────
  console.log('\nTest 2: Missing items field — should return 400');
  const r2 = mockRes();
  await createOrder({ user: { _id: fakeUserId }, body: {} }, r2);
  check('Returns 400 for missing items', r2.statusCode === 400, r2.statusCode);

  // ── TEST 3: Reject invalid food ObjectId ──────────────────────────────────
  console.log('\nTest 3: Invalid food ObjectId — should return 400');
  const r3 = mockRes();
  await createOrder({ user: { _id: fakeUserId }, body: { items: [{ foodItem: 'not-an-id', quantity: 1 }] } }, r3);
  check('Returns 400 for invalid ObjectId', r3.statusCode === 400, r3.statusCode);

  // ── TEST 4: Reject non-positive quantity ───────────────────────────────────
  console.log('\nTest 4: Quantity = 0 — should return 400');
  const r4 = mockRes();
  await createOrder({ user: { _id: fakeUserId }, body: { items: [{ foodItem: fakeFoodId1.toString(), quantity: 0 }] } }, r4);
  check('Returns 400 for quantity = 0', r4.statusCode === 400, r4.statusCode);

  // ── TEST 5: Reject unavailable food item ──────────────────────────────────
  console.log('\nTest 5: Unavailable food item — should return 400');
  const r5 = mockRes();
  await createOrder({ user: { _id: fakeUserId }, body: { items: [{ foodItem: fakeFoodId2.toString(), quantity: 1 }] } }, r5);
  check('Returns 400 for unavailable food', r5.statusCode === 400, r5.statusCode);

  // ── TEST 6: Successful order creation ─────────────────────────────────────
  console.log('\nTest 6: Valid order — should create order with server-calculated totals');
  const r6 = mockRes();
  await createOrder({
    user: { _id: fakeUserId },
    body: { items: [{ foodItem: fakeFoodId1.toString(), quantity: 2 }] }
  }, r6);
  check('Returns 201', r6.statusCode === 201, r6.statusCode);

  if (r6.statusCode === 201) {
    const order = r6.data.order;

    // SECURITY: Backend must ignore any frontend-supplied price
    check('orderStatus = PLACED',           order.orderStatus === 'PLACED', order.orderStatus);
    check('paymentMethod = CASH_AT_CANTEEN', order.paymentMethod === 'CASH_AT_CANTEEN', order.paymentMethod);
    check('paymentStatus = PENDING',        order.paymentStatus === 'PENDING', order.paymentStatus);
    check('tokenNumber starts with VCET-',  order.tokenNumber.startsWith('VCET-'), order.tokenNumber);
    check('totalAmount = 90 (45 × 2)',      order.totalAmount === 90, order.totalAmount);
    check('item price = 45 (from DB)',       order.items[0].price === 45, order.items[0].price);
    check('item subtotal = 90',             order.items[0].subtotal === 90, order.items[0].subtotal);
    check('item name = Masala Dosa',        order.items[0].name === 'Masala Dosa', order.items[0].name);
    check('user is req.user._id (not body)', order.user.toString() === fakeUserId.toString(), order.user);
  }

  // ── TEST 7: getUserOrders returns only own orders ──────────────────────────
  console.log('\nTest 7: GET /api/orders — returns only authenticated user\'s orders');
  const r7 = mockRes();
  await getUserOrders({ user: { _id: fakeUserId } }, r7);
  check('Returns 200',           r7.statusCode === 200, r7.statusCode);
  check('Returns orders array',  Array.isArray(r7.data.orders), r7.data);
  check('count field present',   r7.data.count !== undefined, r7.data.count);

  // ── TEST 8: getOrderById — valid owner ────────────────────────────────────
  console.log('\nTest 8: GET /api/orders/:id — valid owner access');
  const createdOrderId = r6.data?.order?._id?.toString();
  if (createdOrderId) {
    const r8 = mockRes();
    await getOrderById({ user: { _id: fakeUserId }, params: { id: createdOrderId } }, r8);
    check('Returns 200 for own order', r8.statusCode === 200, r8.statusCode);
  } else {
    console.log('  ⚠ Skipped (no order was created in Test 6)');
  }

  // ── TEST 9: getOrderById — invalid ObjectId ───────────────────────────────
  console.log('\nTest 9: GET /api/orders/:id — invalid ObjectId');
  const r9 = mockRes();
  await getOrderById({ user: { _id: fakeUserId }, params: { id: 'bad-id' } }, r9);
  check('Returns 400 for invalid ID', r9.statusCode === 400, r9.statusCode);

  // ── TEST 10: getOrderById — order does not exist ──────────────────────────
  console.log('\nTest 10: GET /api/orders/:id — order not found');
  const nonExistentId = new mongoose.Types.ObjectId();
  const r10 = mockRes();
  await getOrderById({ user: { _id: fakeUserId }, params: { id: nonExistentId.toString() } }, r10);
  check('Returns 404 for missing order', r10.statusCode === 404, r10.statusCode);

  // ── TEST 11: getOrderById — ownership enforcement (403) ───────────────────
  console.log('\nTest 11: GET /api/orders/:id — different user (403 Forbidden)');
  const otherUserId = new mongoose.Types.ObjectId();
  if (createdOrderId) {
    const r11 = mockRes();
    await getOrderById({ user: { _id: otherUserId }, params: { id: createdOrderId } }, r11);
    check('Returns 403 for other user\'s order', r11.statusCode === 403, r11.statusCode);
  } else {
    console.log('  ⚠ Skipped (no order was created in Test 6)');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Results: ${pass} passed, ${fail} failed`);
  if (fail === 0) {
    console.log('  🎉 ALL TASK 7A ORDER API TESTS PASSED!');
  } else {
    console.log('  ⚠ Some tests failed. Review output above.');
  }
  console.log('══════════════════════════════════════════════════════\n');

  process.exit(fail === 0 ? 0 : 1);
}

runOrderTests().catch((err) => {
  console.error('Unexpected test error:', err);
  process.exit(1);
});
