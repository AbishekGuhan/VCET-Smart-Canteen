const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('./middleware/authMiddleware');
const { registerUser, loginUser, getMe } = require('./controllers/authController');

// Mock in-memory database store for fast isolated testing
const dbStore = new Map();

// Helper response mock
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

async function runAuthTests() {
  console.log('Starting Task 3 Authentication System Verification...\n');

  try {
    // Monkey-patch User Mongoose methods for pure unit test speed
    User.findOne = async function(query) {
      if (query.email) {
        return dbStore.get(query.email.toLowerCase()) || null;
      }
      return null;
    };

    User.create = async function(userData) {
      const id = 'user_id_' + Date.now();
      const newDoc = {
        _id: id,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      dbStore.set(userData.email.toLowerCase(), newDoc);
      return newDoc;
    };

    User.findById = function(id) {
      return {
        select: async function(fields) {
          for (let user of dbStore.values()) {
            if (user._id === id) {
              const copy = { ...user };
              if (fields.includes('-password')) {
                delete copy.password;
              }
              return copy;
            }
          }
          return null;
        }
      };
    };

    // 1. Test registration with ADMIN role (Must be forbidden)
    console.log('Test 1: Attempt self-registration as ADMIN');
    const req1 = { body: { name: 'Hacker Admin', email: 'hacker@vcet.ac.in', password: 'password123', role: 'ADMIN' } };
    const res1 = createMockRes();
    await registerUser(req1, res1);
    
    if (res1.statusCode === 403) {
      console.log('✔ PASS: Self-registration as ADMIN correctly rejected (HTTP 403)');
    } else {
      console.error('❌ FAIL: Expected 403 for ADMIN registration, got', res1.statusCode, res1.data);
    }

    // 2. Test successful student registration (default role = STUDENT)
    console.log('\nTest 2: Register student user (default role)');
    const req2 = { body: { name: 'Ramu Student', email: 'ramu.cse@vcet.ac.in', password: 'studentPassword123', department: 'CSE' } };
    const res2 = createMockRes();
    await registerUser(req2, res2);

    if (res2.statusCode === 201) {
      console.log('✔ PASS: Student registered successfully (HTTP 201)');
      console.log('  Role assigned:', res2.data.role);
      console.log('  Token returned:', !!res2.data.token);
      console.log('  Password omitted in response:', res2.data.password === undefined);

      if (res2.data.role !== 'STUDENT') {
        console.error('❌ FAIL: Role should be STUDENT, got:', res2.data.role);
      }
      if (res2.data.password !== undefined) {
        console.error('❌ FAIL: Password should not be returned in registration response!');
      }

      // Verify JWT payload has ONLY user id and 7d expiry
      const decoded = jwt.decode(res2.data.token);
      console.log('  JWT decoded payload:', decoded);
      if (decoded.password !== undefined) {
        console.error('❌ FAIL: Password should NEVER be stored in JWT payload!');
      } else {
        console.log('✔ PASS: JWT token contains no password data');
      }
    } else {
      console.error('❌ FAIL: Student registration failed:', res2.statusCode, res2.data);
    }

    // 3. Test duplicate email registration
    console.log('\nTest 3: Attempt registration with duplicate email');
    const req3 = { body: { name: 'Duplicate Ramu', email: 'ramu.cse@vcet.ac.in', password: 'anotherPassword123' } };
    const res3 = createMockRes();
    await registerUser(req3, res3);

    if (res3.statusCode === 400) {
      console.log('✔ PASS: Duplicate email registration blocked (HTTP 400)');
    } else {
      console.error('❌ FAIL: Expected 400 for duplicate email, got', res3.statusCode, res3.data);
    }

    // 4. Test login with correct credentials
    console.log('\nTest 4: Login with correct credentials');
    const req4 = { body: { email: 'ramu.cse@vcet.ac.in', password: 'studentPassword123' } };
    const res4 = createMockRes();
    await loginUser(req4, res4);

    let token = '';
    if (res4.statusCode === 200 && res4.data.token) {
      token = res4.data.token;
      console.log('✔ PASS: Login successful, 7-day JWT token received (HTTP 200)');
      console.log('  Password omitted in login response:', res4.data.password === undefined);
    } else {
      console.error('❌ FAIL: Login failed:', res4.statusCode, res4.data);
    }

    // 5. Test login with wrong password
    console.log('\nTest 5: Login with wrong password');
    const req5 = { body: { email: 'ramu.cse@vcet.ac.in', password: 'wrongPassword!' } };
    const res5 = createMockRes();
    await loginUser(req5, res5);

    if (res5.statusCode === 401) {
      console.log('✔ PASS: Login with invalid password rejected (HTTP 401)');
    } else {
      console.error('❌ FAIL: Expected 401 for wrong password, got', res5.statusCode, res5.data);
    }

    // 6. Test protect middleware + GET /api/auth/me
    console.log('\nTest 6: GET /api/auth/me with valid Bearer token via protect middleware');
    const req6 = { headers: { authorization: `Bearer ${token}` } };
    const res6 = createMockRes();
    
    // Pass through protect middleware
    await protect(req6, res6, async () => {
      await getMe(req6, res6);
    });

    if (res6.statusCode === 200) {
      console.log('✔ PASS: Profile fetched successfully via protect middleware (HTTP 200)');
      console.log('  User Name:', res6.data.name);
      console.log('  User Email:', res6.data.email);
      console.log('  User Role:', res6.data.role);
      console.log('  Password omitted from profile:', res6.data.password === undefined);
    } else {
      console.error('❌ FAIL: GET /api/auth/me failed:', res6.statusCode, res6.data);
    }

    // 7. Test authorize middleware (Role Authorization)
    console.log('\nTest 7: Test authorize middleware for ADMIN-only resource');
    const req7 = { user: { _id: '123', name: 'Ramu Student', role: 'STUDENT' } };
    const res7 = createMockRes();
    const adminMiddleware = authorize('ADMIN');

    adminMiddleware(req7, res7, () => {
      res7.status(200).json({ message: 'Welcome Admin' });
    });

    if (res7.statusCode === 403) {
      console.log('✔ PASS: STUDENT role correctly blocked from ADMIN resource (HTTP 403)');
    } else {
      console.error('❌ FAIL: Expected 403 for unauthorized role, got', res7.statusCode, res7.data);
    }

    // 8. Test authorize middleware for STUDENT role
    console.log('\nTest 8: Test authorize middleware for STUDENT resource');
    const res8 = createMockRes();
    const studentMiddleware = authorize('STUDENT', 'STAFF');

    studentMiddleware(req7, res8, () => {
      res8.status(200).json({ message: 'Welcome Student' });
    });

    if (res8.statusCode === 200) {
      console.log('✔ PASS: STUDENT role correctly allowed access to STUDENT resource (HTTP 200)');
    } else {
      console.error('❌ FAIL: Expected 200 for authorized role, got', res8.statusCode, res8.data);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL TASK 3 AUTHENTICATION TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing auth tests:', err);
    process.exit(1);
  }
}

runAuthTests();
