import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'STAFF':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-bold text-xl text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            VCET
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white group-hover:text-amber-400 transition-colors">
              VCET Smart Canteen
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Madurai Campus Portal
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Admin Navigation */}
          {isAuthenticated && user?.role === 'ADMIN' ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/admin"
                className="text-xs sm:text-sm font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30"
                id="nav-admin-dashboard-link"
              >
                <span>🛡️</span> Admin Console
              </Link>
              <Link
                to="/admin/inventory"
                className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                id="nav-admin-inventory-link"
              >
                <span>📦</span> Inventory
              </Link>
              <Link
                to="/admin/sales"
                className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                id="nav-admin-sales-link"
              >
                <span>📊</span> Sales
              </Link>

              {/* Admin Profile Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="h-7 w-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold uppercase">
                  A
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-200 leading-none">{user.name}</p>
                  <span className="inline-block text-[10px] font-semibold border px-1.5 py-0.5 rounded mt-0.5 bg-red-500/10 text-red-400 border-red-500/30">
                    ADMIN
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg border border-slate-700 hover:border-red-500/40 transition-all"
                id="logout-btn"
              >
                Logout
              </button>
            </div>
          ) : isAuthenticated && user ? (
            /* Student & Staff Navigation */
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/menu"
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                id="nav-menu-link"
              >
                <span>🍱</span> Menu
              </Link>

              <Link
                to="/cart"
                className="relative px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-sm font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                id="nav-cart-link"
              >
                <span>🛒</span> Cart
                {totalItemsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[11px] leading-none animate-pulse">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              <Link
                to="/orders"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                id="nav-orders-link"
              >
                <span>🎟️</span> My Orders
              </Link>

              {/* Student Profile Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold uppercase">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-200 leading-none">{user.name}</p>
                  <span className={`inline-block text-[10px] font-semibold border px-1.5 py-0.5 rounded mt-0.5 ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg border border-slate-700 hover:border-red-500/40 transition-all"
                id="logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            /* Logged Out Navigation */
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/menu"
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                id="nav-menu-link"
              >
                <span>🍱</span> Menu
              </Link>

              <Link
                to="/cart"
                className="relative px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-sm font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                id="nav-cart-link"
              >
                <span>🛒</span>
                {totalItemsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[11px] leading-none">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              <Link
                to="/login"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                id="nav-login-btn"
              >
                Student Login
              </Link>
              <Link
                to="/admin/login"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 transition-colors hidden sm:inline-block border border-red-500/30 rounded-lg bg-red-500/10"
                id="nav-admin-portal-btn"
              >
                🛡️ Admin Portal
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md hover:shadow-amber-500/25 transition-all"
                id="nav-register-btn"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

