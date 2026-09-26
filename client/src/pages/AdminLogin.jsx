import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user?.role !== 'ADMIN') {
        logout();
        setFormError('Access Denied: This portal is strictly restricted to VCET Canteen Administrators. Student/Staff accounts must use the Student Login.');
      } else {
        navigate('/admin', { replace: true });
      }
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-950 p-8 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-950/20 relative overflow-hidden">
        {/* Top security accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-red-500/10 text-red-400 items-center justify-center font-bold text-2xl mb-3 border border-red-500/30 shadow-inner">
            🛡️
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold tracking-wide border border-red-500/20 mb-2">
            RESTRICTED ACCESS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Admin Management Portal
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Velammal College of Engineering & Technology (VCET)
          </p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-start gap-2.5">
            <span className="text-base leading-none">⚠️</span>
            <span className="leading-relaxed">{formError}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter administrator email"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-medium px-1 py-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Authenticating Admin…</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Enter Admin Console</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Student Login */}
        <div className="pt-2 text-center border-t border-slate-900">
          <p className="text-xs text-slate-400">
            Are you a student or staff member?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
              Go to Student Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
