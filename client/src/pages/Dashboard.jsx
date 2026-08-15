import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            VCET Smart Canteen Member Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'VCET Student'}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Velammal College of Engineering and Technology, Madurai
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${getRoleBadgeColor(user?.role)}`}>
            Role: {user?.role || 'STUDENT'}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-xl border border-slate-700 hover:border-red-500/40 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>👤</span> Member Profile
          </h2>
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Full Name</span>
              <span className="font-semibold text-slate-200">{user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Email Address</span>
              <span className="font-semibold text-slate-200">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-amber-400">{user?.department || 'Not Provided'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">ID / Reg Number</span>
              <span className="font-semibold text-slate-200">{user?.registerNumber || 'Not Provided'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Phone Contact</span>
              <span className="font-semibold text-slate-200">{user?.phone || 'Not Provided'}</span>
            </div>
          </div>
        </div>

        {/* Canteen Shortcuts & Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Quick Action 1 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                🍛
              </div>
              <h3 className="font-bold text-white text-base mb-1">Pre-Order Food</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Browse breakfast, meals, and snacks menu for quick counter pickup.
              </p>
              <span className="inline-flex items-center text-xs font-semibold text-amber-400 group-hover:underline">
                Menu coming soon in next task &rarr;
              </span>
            </div>

            {/* Quick Action 2 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                🎫
              </div>
              <h3 className="font-bold text-white text-base mb-1">Active Token Status</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Monitor your current order preparation token status live.
              </p>
              <span className="inline-flex items-center text-xs font-semibold text-amber-400 group-hover:underline">
                Token system coming in next task &rarr;
              </span>
            </div>
          </div>

          {/* Notice Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
              <span>📌</span> Canteen Operating Hours
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              VCET Canteen is open Monday through Saturday from 7:30 AM to 5:30 PM. Pre-orders placed 15 minutes in advance are prioritized for rapid pickup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
