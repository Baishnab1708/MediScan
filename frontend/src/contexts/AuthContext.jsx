import React, { createContext, useContext, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi, signup as signupApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser({ username: decoded.sub });
        }
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginApi(credentials);
      const { access_token } = response;
      localStorage.setItem('token', access_token);
      const decoded = jwtDecode(access_token);
      setUser({ username: decoded.sub });
      setLoading(false);
      return true;
    } catch (err) {
      // Extract the actual error message from the backend
      let errorMessage = 'Failed to login';
      
      if (err.message) {
        // If it's our custom error from api.js, use it directly
        errorMessage = err.message;
      } else if (err.response?.data?.detail) {
        // If it's a direct axios error, extract the detail
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await signupApi(userData);
      setLoading(false);
      return response;
    } catch (err) {
      // Extract the actual error message from the backend
      let errorMessage = 'Failed to sign up';
      
      if (err.message) {
        // If it's our custom error from api.js, use it directly
        errorMessage = err.message;
      } else if (err.response?.data?.detail) {
        // If it's a direct axios error, extract the detail
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage); // Throw so AuthForm can catch it
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};