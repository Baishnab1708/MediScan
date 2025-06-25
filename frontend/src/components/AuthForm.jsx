import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, LockKeyhole } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthForm = ({ initialTab = 'signup' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, signup, error: authError, clearError } = useAuth();

  // Form data states
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginData, setLoginData] = useState({
    credential: '',
    password: ''
  });

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
    if (authError) clearError();
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
    if (authError) clearError();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { credential, password } = loginData;
    if (!credential || !password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const success = await login({
        username: credential,
        password
      });

      if (success) {
        navigate('/dashboard');
      } else {
        // Use the error from AuthContext which comes from backend
        const errorMessage = authError || 'Invalid credentials';
        setError(errorMessage);
      }
    } catch (err) {
      // Handle any unexpected errors
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { username, email, password, confirmPassword } = signupData;
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await signup({
        username,
        email,
        password
      });

      if (result) {
        // Auto login after signup
        const loginSuccess = await login({ username, password });
        if (loginSuccess) {
          navigate('/dashboard');
        } else {
          setActiveTab('login');
          setError('Registration successful. Please log in.');
        }
      } else {
        // Use the error from AuthContext which comes from backend
        const errorMessage = authError || 'Signup failed. Please try again.';
        setError(errorMessage);
      }
    } catch (err) {
      // This will show the backend error message (like "User already exists")
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-gray-800 dark:text-gray-100 text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2">
        Welcome to <span className="text-green-600 dark:text-green-500">MediScan</span>
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base text-center mb-6 sm:mb-8">
        Access your account or create a new one to begin.
      </p>

      <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
        <button 
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeTab === 'login' 
              ? 'border-b-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 font-semibold' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('login')}
        >
          Log In
        </button>
        <button 
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeTab === 'signup' 
              ? 'border-b-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 font-semibold' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </button>
      </div>

      {(error || authError) && (
        <motion.div 
          className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {error || authError}
        </motion.div>
      )}

      {activeTab === 'login' ? (
        <motion.form 
          className="flex flex-col gap-4 sm:gap-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleLoginSubmit}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="loginCredential">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:border-green-600 dark:focus:border-green-500 focus:ring-green-600 dark:focus:ring-green-500 focus:ring-opacity-50 h-10 sm:h-12 pl-10 pr-4 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                id="loginCredential"
                name="credential"
                placeholder="Enter your email or username"
                type="text"
                value={loginData.credential}
                onChange={handleLoginChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="loginPassword">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:border-green-600 dark:focus:border-green-500 focus:ring-green-600 dark:focus:ring-green-500 focus:ring-opacity-50 h-10 sm:h-12 pl-10 pr-4 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                id="loginPassword"
                name="password"
                placeholder="Enter your password"
                type="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>
          </div>

          <button 
            className={`w-full flex items-center justify-center rounded-md h-10 sm:h-11 px-4 bg-green-600 dark:bg-green-600 text-white text-sm font-semibold hover:bg-green-700 dark:hover:bg-green-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : 'Log In'}
          </button>

          <p className="text-gray-500 dark:text-gray-400 text-xs text-center">
            Don't have an account?{' '}
            <button 
              className="font-semibold text-green-600 dark:text-green-500 hover:underline"
              type="button"
              onClick={() => setActiveTab('signup')}
            >
              Sign up
            </button>
          </p>
        </motion.form>
      ) : (
        <motion.form 
          className="flex flex-col gap-4 sm:gap-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSignupSubmit}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="signupUsername">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:border-green-600 dark:focus:border-green-500 focus:ring-green-600 dark:focus:ring-green-500 focus:ring-opacity-50 h-10 sm:h-12 pl-10 pr-4 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                id="signupUsername"
                name="username"
                placeholder="Choose a username"
                type="text"
                value={signupData.username}
                onChange={handleSignupChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="signupEmail">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:border-green-600 dark:focus:border-green-500 focus:ring-green-600 dark:focus:ring-green-500 focus:ring-opacity-50 h-10 sm:h-12 pl-10 pr-4 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                id="signupEmail"
                name="email"
                placeholder="you@example.com"
                type="email"
                value={signupData.email}
                onChange={handleSignupChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="signupPassword">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:border-green-600 dark:focus:border-green-500 focus:ring-green-600 dark:focus:ring-green-500 focus:ring-opacity-50 h-10 sm:h-12 pl-10 pr-4 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                id="signupPassword"
                name="password"
                placeholder="Create a strong password"
                type="password"
                value={signupData.password}
                onChange={handleSignupChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="confirmPassword">
              Retype Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:border-green-600 dark:focus:border-green-500 focus:ring-green-600 dark:focus:ring-green-500 focus:ring-opacity-50 h-10 sm:h-12 pl-10 pr-4 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Retype your password"
                type="password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                required
              />
            </div>
          </div>

          <button 
            className={`w-full flex items-center justify-center rounded-md h-10 sm:h-11 px-4 bg-green-600 dark:bg-green-600 text-white text-sm font-semibold hover:bg-green-700 dark:hover:bg-green-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing up...
              </>
            ) : 'Sign Up'}
          </button>

          <p className="text-gray-500 dark:text-gray-400 text-xs text-center">
            Already have an account?{' '}
            <button 
              className="font-semibold text-green-600 dark:text-green-500 hover:underline"
              type="button"
              onClick={() => setActiveTab('login')}
            >
              Log in
            </button>
          </p>
        </motion.form>
      )}
    </div>
  );
};

export default AuthForm;