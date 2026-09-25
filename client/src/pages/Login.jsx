import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Strictly prevent Admin accounts from logging in through the Student Portal
      if (result.user?.role === 'ADMIN') {
        logout();
        setFormError('Access Denied: Administrator credentials cannot be used to log in through the Student portal. Please use the dedicated Admin Portal.');
        return;
      }
      navigate(from || '/menu', { replace: true });
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 items-center justify-center font-bold text-2xl mb-3 border border-amber-500/20 shadow-inner">
            🎓
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold tracking-wide border border-amber-500/20 mb-2">
            STUDENT & STAFF PORTAL
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            VCET Smart Canteen
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Sign in to order food, track live pickup tokens, and skip the line
          </p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold space-y-2">
            <div className="flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <span className="leading-relaxed">{formError}</span>
            </div>
            {formError.includes('Admin') && (
              <div className="pt-1">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-500/40"
                >
                  <span>🛡️</span> Switch to Admin Portal Login →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                College Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@vcet.edu"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all pr-12"
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
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-slate-950/20 border-t-slate-950 animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Sign In & Order Food</span>
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="space-y-3 pt-2 text-center border-t border-slate-900 text-xs text-slate-400">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
              Register here →
            </Link>
          </p>
          <div className="pt-2 border-t border-slate-900/60">
            <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-red-400/80 hover:text-red-400 font-semibold transition-colors">
              <span>🛡️</span> Canteen Admin Portal Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

