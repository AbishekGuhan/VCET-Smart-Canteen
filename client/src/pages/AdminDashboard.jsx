import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboardStats } from '../services/adminService';

// ---------------------------------------------------------------------------
// Admin Dashboard Page (/admin)
// Protected: ADMIN role only
// ---------------------------------------------------------------------------
const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      const status = err.response?.status;
      if (status === 403) {
        setError('Access denied. Administrator privileges are required.');
      } else if (status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Unable to load dashboard statistics. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ── Stat Card Configuration ───────────────────────────────────────────────
  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: '📦',
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/30',
      description: 'Lifetime orders recorded in system',
    },
    {
      title: "Today's Orders",
      value: stats?.todayOrders ?? 0,
      icon: '📅',
      color: 'text-amber-400',
      bgGradient: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/30',
      description: 'Orders placed since midnight',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      icon: '⏳',
      color: 'text-orange-400',
      bgGradient: 'from-orange-500/10 to-transparent',
      borderColor: 'border-orange-500/30',
      description: 'Placed, confirmed, or preparing',
    },
    {
      title: 'Completed Orders',
      value: stats?.completedOrders ?? 0,
      icon: '✅',
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      description: 'Fulfilled & collected at canteen',
    },
    {
      title: 'Total Sales',
      value: `₹${(stats?.totalSales ?? 0).toLocaleString('en-IN')}`,
      icon: '💰',
      color: 'text-green-400',
      bgGradient: 'from-green-500/10 to-transparent',
      borderColor: 'border-green-500/30',
      description: 'Gross revenue from non-cancelled orders',
    },
    {
      title: 'Available Food',
      value: stats?.availableFood ?? 0,
      icon: '🍱',
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/10 to-transparent',
      borderColor: 'border-cyan-500/30',
      description: 'Active items ready on current menu',
    },
    {
      title: 'Low-Stock Inventory',
      value: stats?.lowStockItems ?? 0,
      icon: '⚠️',
      color: stats?.lowStockItems > 0 ? 'text-red-400' : 'text-slate-400',
      bgGradient: stats?.lowStockItems > 0 ? 'from-red-500/10 to-transparent' : 'from-slate-500/10 to-transparent',
      borderColor: stats?.lowStockItems > 0 ? 'border-red-500/40' : 'border-slate-800',
      description: 'Items at or below minimum threshold',
      alert: stats?.lowStockItems > 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Top Header Banner ── */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
            VCET Canteen Administration Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Admin Overview & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Logged in as <span className="text-white font-semibold">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/inventory"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>📦</span> Manage Inventory
          </Link>
          <Link
            to="/admin/sales"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>📊</span> Sales Analytics
          </Link>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2"
            title="Refresh statistics"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span> Refresh Metrics
          </button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 bg-slate-950/40 rounded-2xl border border-slate-800 p-12">
          <div className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Aggregating live cafeteria statistics…</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-10 shadow-xl text-center max-w-lg mx-auto my-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-red-400 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchStats}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            Retry Request
          </button>
        </div>
      )}

      {/* ── Dashboard Stats Grid ── */}
      {!loading && !error && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {statCards.map((card, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-slate-950 border bg-gradient-to-br ${card.bgGradient} ${card.borderColor} shadow-lg hover:border-slate-600 transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                  <div className={`text-3xl font-extrabold tracking-tight ${card.color} mb-1.5`}>
                    {card.value}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal border-t border-slate-900 pt-3 mt-3">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Operational Quick Summary Note */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">ℹ️</span>
              <div>
                <h3 className="text-sm font-bold text-white">Live Data Synchronization</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  All counters above are computed directly from the VCET Smart Canteen database.
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Last synced: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
