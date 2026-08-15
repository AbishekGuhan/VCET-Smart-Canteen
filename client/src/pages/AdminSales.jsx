import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminSalesAnalytics } from '../services/adminService';

// ---------------------------------------------------------------------------
// Admin Sales & Revenue Analytics Page (/admin/sales)
// Protected: ADMIN role only
// ---------------------------------------------------------------------------
const AdminSales = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSales = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminSalesAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load sales data:', err);
      const status = err.response?.status;
      if (status === 403) setError('Access denied. Administrator privileges required.');
      else setError('Failed to load sales analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Header Banner ── */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            VCET Canteen Financials
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Sales & Revenue Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time breakdown of cafeteria revenue, top selling food items, and daily order volume
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all"
          >
            ← Admin Dashboard
          </Link>
          <Link
            to="/admin/inventory"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all"
          >
            📦 Manage Stock
          </Link>
          <button
            onClick={fetchSales}
            disabled={loading}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:shadow-amber-500/25 transition-all flex items-center gap-1.5"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span> Refresh Analytics
          </button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 bg-slate-950/40 rounded-2xl border border-slate-800 p-12">
          <div className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Aggregating sales and revenue reports…</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-10 shadow-xl text-center max-w-lg mx-auto my-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Analytics Error</h2>
          <p className="text-red-400 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchSales}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Analytics Content ── */}
      {!loading && !error && analytics && (
        <div className="space-y-8">
          {/* Top Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Gross Sales</span>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-extrabold text-emerald-400">
                ₹{analytics.totalSales.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 mt-2">Across all completed/placed orders</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Today's Sales</span>
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-3xl font-extrabold text-amber-400">
                ₹{analytics.todaySales.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                {analytics.todayOrders} {analytics.todayOrders === 1 ? 'order' : 'orders'} placed today
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Completed Orders</span>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-3xl font-extrabold text-blue-400">
                {analytics.completedOrders}
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Out of {analytics.totalOrders} total orders placed
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Average Order Value</span>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-3xl font-extrabold text-purple-400">
                ₹
                {analytics.totalOrders > 0
                  ? (analytics.totalSales / analytics.totalOrders).toFixed(1)
                  : '0'}
              </p>
              <p className="text-[11px] text-slate-500 mt-2">Average bill size per token</p>
            </div>
          </div>

          {/* Grid of Tables: Top Sellers & Sales Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Most Ordered Food Items */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🏆</span> Most Ordered Food Items
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold uppercase">Top Ranked</span>
                </div>

                {analytics.mostOrderedFood?.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No food orders recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-900">
                    {analytics.mostOrderedFood?.map((food, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              idx === 0
                                ? 'bg-amber-500 text-slate-950'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-950'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-900 text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-white">{food.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-400">{food.totalQuantity} ordered</p>
                          <p className="text-[11px] text-slate-500">₹{food.totalRevenue} revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sales by Date Timeline */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>📅</span> Sales by Date
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold uppercase">Recent Days</span>
                </div>

                {analytics.salesByDate?.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No sales history recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-900">
                    {analytics.salesByDate?.map((record, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">🗓️</span>
                          <div>
                            <p className="font-mono text-xs font-bold text-slate-200">{record.date}</p>
                            <p className="text-[11px] text-slate-500">
                              {record.orderCount} {record.orderCount === 1 ? 'order' : 'orders'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-emerald-400 text-base">
                            ₹{record.revenue.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-slate-600">Daily Total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSales;
