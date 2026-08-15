# VCET Smart Canteen System

**Velammal College of Engineering and Technology (VCET), Madurai**

A comprehensive, production-ready MERN stack web application built to modernize campus cafeteria operations, digital meal pre-ordering, token-based pickups, inventory management, and real-time sales analytics.

---

## 📌 Features

### 👤 User & Student Features
* **Role-Based Authentication**: Secure JWT authentication with bcrypt password hashing (Roles: `STUDENT`, `STAFF`, `ADMIN`).
* **Interactive Menu & Categories**: Browse categorized food items (South Indian Breakfast, Lunch & Thali, Snacks & Quick Bites, Beverages) with real-time search, filters, and dietary tags.
* **Smart Cart System**: Persistent client-side cart management with live item counts, price calculations, and stock availability guards.
* **Streamlined Checkout**: Cash-at-canteen checkout with order summary and instant backend validation.
* **Token-Based Order Confirmation**: Unique pickup tokens (`VCET-XXXXX`) generated server-side for quick meal collection.
* **Order History & Live Status**: Comprehensive order history and status timeline (`PLACED` → `CONFIRMED` → `PREPARING` → `READY_FOR_PICKUP` → `COMPLETED` / `CANCELLED`).

### 🛡️ Admin Features
* **Admin Dashboard (`/admin`)**: Real-time KPI cards displaying Total Orders, Today's Orders, Pending Orders, Completed Orders, Total Sales, Available Food items, and Low-Stock alerts.
* **Inventory Management (`/admin/inventory`)**: Full CRUD operations for stock, threshold limits, restock actions, and instant low-stock filtering (`currentStock <= minThreshold`).
* **Sales & Revenue Analytics (`/admin/sales`)**: Aggregated metrics on gross sales, today's revenue, order counts, top-selling food items, and daily sales trends.
* **Role-Based Access Control (RBAC)**: All administrative endpoints and UI routes are strictly guarded (`403 Forbidden` for non-admin accounts).

---

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router DOM (v6)
* **Backend**: Node.js, Express.js, Mongoose ODM
* **Database**: MongoDB Atlas
* **Security & Auth**: JSON Web Tokens (JWT), bcryptjs
* **Architecture**: RESTful API, Modular Controller-Service-Route structure

---

## 📁 Project Structure

```
vcet-smart-canteen/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, FoodCard, ProtectedRoute, etc.)
│   │   ├── context/            # Global State (AuthContext, CartContext)
│   │   ├── pages/              # Views (Menu, Cart, Landing, Login, Register, Dashboard)
│   │   │   └── user/           # User pages (Checkout, OrderConfirmation, Orders, OrderDetails)
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminInventory.jsx
│   │   │   └── AdminSales.jsx
│   │   ├── services/           # Axios API clients (adminService, orderService)
│   │   ├── App.jsx             # Route definitions and route guards
│   │   ├── main.jsx            # React root entry
│   │   └── index.css           # Tailwind CSS directives & custom styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── config/                 # Database connection (db.js)
│   ├── controllers/            # Request handlers (auth, food, category, order, admin, inventory)
│   ├── middleware/             # Auth & RBAC guards (authMiddleware.js)
│   ├── models/                 # Mongoose schemas (User, FoodItem, Category, Order, Inventory)
│   ├── routes/                 # Express route handlers
│   ├── seed/                   # Database seed scripts (seedMenu.js)
│   ├── index.js                # Server entry point
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
* **Node.js**: v18+ installed
* **npm**: v9+ installed
* **MongoDB Atlas** account with a cluster

---

### 1. Clone & Navigate to Project

```bash
git clone <repository-url>
cd vcet-smart-canteen
```

---

### 2. Backend Configuration & Startup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Edit `server/.env` with your credentials:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/vcet-smart-canteen?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

```bash
# (Optional) Seed sample categories and food menu items
node seed/seedMenu.js

# Start the backend server
npm run dev
# Server will start on http://localhost:5000
```

---

### 3. Frontend Configuration & Startup

In a new terminal window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Frontend will start on http://localhost:3000
```

---

### 4. Production Build

To build the client bundle for production:

```bash
cd client
npm run build
```

---

## 🔑 Environment Variables

| Variable | Description | Example / Default |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://<user>:<pwd>@cluster0...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `vcet_jwt_super_secret_key` |
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:3000` |

> ⚠️ **Note:** Never commit `.env` to version control. All `.env*` files are ignored by `.gitignore`.

---

## 👥 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `vcetadmin@vcet.edu` | `Admin@1234` | Full access (`/admin`, `/admin/inventory`, `/admin/sales`) |
| **Student** | Self-register via `/register` or `teststudent9@vcet.edu` | `Student@1234` | Menu, Cart, Checkout, Orders (`/orders`) |

---

## 📡 API Overview

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new student or staff account
* `POST /api/auth/login` — Authenticate user and return 7-day JWT token
* `GET /api/auth/me` — Get authenticated user profile (`Bearer <token>`)

### 🍱 Food Menu & Categories (`/api/food`, `/api/categories`)
* `GET /api/categories` — List all food categories
* `POST /api/categories` — Create category *(Admin only)*
* `GET /api/food` — List food items (Supports `?category=`, `?search=`, `?sort=`)
* `GET /api/food/:id` — Get food item details
* `POST /api/food` — Create food item *(Admin only)*
* `PUT /api/food/:id` — Update food item *(Admin only)*
* `DELETE /api/food/:id` — Delete food item *(Admin only)*

### 🛒 Orders (`/api/orders`)
* `POST /api/orders` — Place order (Server calculates prices directly from DB)
* `GET /api/orders` — List authenticated user's order history
* `GET /api/orders/:id` — Get specific order details (Restricted to order owner / admin)

### 📦 Inventory (`/api/inventory` — Admin Only)
* `GET /api/inventory` — List inventory items (Supports `?lowStockOnly=true`)
* `GET /api/inventory/:id` — Get single inventory record
* `POST /api/inventory` — Create inventory record
* `PUT /api/inventory/:id` — Update stock levels / restock
* `DELETE /api/inventory/:id` — Delete inventory record

### 📊 Admin Analytics (`/api/admin` — Admin Only)
* `GET /api/admin/dashboard` — Live KPI counters (orders, sales, inventory)
* `GET /api/admin/sales` — Sales metrics, top sellers, and revenue timeline

### 🩺 System Health
* `GET /api/health` — Backend server heartbeat
* `GET /api/db-test` — MongoDB connection state & registered Mongoose models

---

## 🧪 Automated Testing

Execute the test suites in the `server/` directory:

```bash
cd server

node test-db.js      # Mongoose models and schema validations
node test-auth.js    # Authentication, JWT, and RBAC middleware
node test-menu.js    # Categories and Food Item CRUD
node test-orders.js  # Order placement, price verification, security checks
node test-admin.js   # Admin Dashboard KPI computations
node test-task9.js   # Inventory CRUD, low-stock filter & sales aggregations
```

---

## 📄 License & Attribution

Developed for **Velammal College of Engineering and Technology (VCET), Madurai**.
All rights reserved © 2026.
