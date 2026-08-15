import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const [apiStatus, setApiStatus] = useState({ loading: true, message: '', error: false });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check backend health endpoint
    axios.get('/api/health')
      .then(res => {
        setApiStatus({ loading: false, message: res.data.message, error: false });
      })
      .catch(err => {
        console.error('API health check error:', err);
        setApiStatus({ loading: false, message: 'Unable to reach backend server', error: true });
      });
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl">
        {/* Institution Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
          Velammal College of Engineering & Technology, Madurai
        </div>

        {/* Main Title */}
        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
          VCET Smart Canteen System
        </h2>

        {/* Short Description */}
        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8">
          Streamline your campus dining experience with instant digital pre-ordering, live cafeteria queue tokens, and cashless food pickups designed exclusively for VCET students and faculty.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-8 py-3.5 text-base font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              Go to Your Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-8 py-3.5 text-base font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
              >
                Login to Account
              </Link>
              <Link
                to="/register"
                className="px-8 py-3.5 text-base font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 hover:border-slate-600 transition-all text-center"
              >
                Create New Account
              </Link>
            </>
          )}
        </div>

        {/* API Health Status Badge */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 max-w-md flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Backend Service Status:</span>
          {apiStatus.loading ? (
            <span className="text-slate-400 animate-pulse">Connecting...</span>
          ) : apiStatus.error ? (
            <span className="text-red-400 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Offline ({apiStatus.message})
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {apiStatus.message}
            </span>
          )}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
            ⚡
          </div>
          <h3 className="font-bold text-white text-lg mb-2">Instant Pre-Ordering</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Order your favorite snacks & meals beforehand to bypass long break-time queues.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
            🎟️
          </div>
          <h3 className="font-bold text-white text-lg mb-2">Digital Token System</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Track live food preparation status with secure digital token numbers on your mobile.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
            🎓
          </div>
          <h3 className="font-bold text-white text-lg mb-2">Campus Community</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Designed specifically for VCET Madurai staff, faculty, and students.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
