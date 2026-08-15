import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vcet_token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios authorization header
  const setAuthHeader = (authToken) => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // On initial mount or token change, restore session via GET /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('vcet_token');
      if (savedToken) {
        setAuthHeader(savedToken);
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
          setToken(savedToken);
        } catch (err) {
          console.error('Session restore failed:', err.response?.data?.message || err.message);
          logout();
        }
      } else {
        setAuthHeader(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: userToken, ...userData } = res.data;
      
      localStorage.setItem('vcet_token', userToken);
      setAuthHeader(userToken);
      setToken(userToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (formData) => {
    setError(null);
    try {
      const res = await axios.post('/api/auth/register', formData);
      const { token: userToken, ...userData } = res.data;

      localStorage.setItem('vcet_token', userToken);
      setAuthHeader(userToken);
      setToken(userToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('vcet_token');
    setAuthHeader(null);
    setToken('');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
