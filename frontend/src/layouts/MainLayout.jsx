import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { CheckCircle, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

const MainLayout = () => {
  const { logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => 
    `text-green-700 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-sm font-medium transition-colors
     ${isActive ? 'font-semibold border-b-2 border-green-600 dark:border-green-500' : ''}`;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <header className="relative z-50  flex flex-col whitespace-nowrap border-b border-solid border-green-200 dark:border-gray-700 px-4 sm:px-6 lg:px-10 py-4 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.25 ml-[-8px] text-slate-800 dark:text-gray-100">
            <img src="/logo.png"  alt="MediScan Logo"  className="h-8 sm:h-10 sm:w-12 object-contain"/>
            <h2 className="text-green-700 dark:text-green-400 text-xl sm:text-2xl font-bold leading-tight tracking-tight">MediScan</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-3" >
            {/* Theme toggle stays inside its own flex for alignment */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>

            {/* Desktop‑only profile + logout */}
            <div className="hidden sm:flex items-center gap-2">
              <img
                src="/doctor.png"
                alt="Doctor avatar"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shadow-sm"
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1  text-green-700 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm hidden lg:inline">Logout</span>
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMenu}
              className="sm:hidden p-2 text-green-700 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
            >
              {isMenuOpen
                ? <X className="h-6 w-6" />
                : <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <motion.nav
          initial={false}
          animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className={`sm:hidden overflow-hidden ${isMenuOpen ? 'mt-4' : ''}`}
        >
          <div className="flex flex-col space-y-2 py-2">
            <NavLink to="/dashboard" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
            <NavLink to="/about" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>About</NavLink>
            <NavLink to="/features" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Features</NavLink>
            <NavLink to="/how-it-works" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>How It Works</NavLink>
            <NavLink to="/privacy" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Privacy</NavLink>
            <NavLink to="/disclaimer" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Disclaimer</NavLink>
            <NavLink to="/contact" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
            <button 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 text-green-700 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </motion.nav>

        {/* Desktop Navigation Menu */}
        <nav className="hidden sm:flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/features" className={navLinkClass}>Features</NavLink>
          <NavLink to="/how-it-works" className={navLinkClass}>How It Works</NavLink>
          <NavLink to="/privacy" className={navLinkClass}>Privacy</NavLink>
          <NavLink to="/disclaimer" className={navLinkClass}>Disclaimer</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>
      </header>

      <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-6 sm:py-8 bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="layout-content-container flex flex-col max-w-5xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="py-6 sm:py-8 px-4 sm:px-6 lg:px-10 border-t border-green-200 dark:border-gray-700 bg-green-700 dark:bg-gray-800 text-green-100 dark:text-gray-300 mt-auto">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-3">MediScan</h3>
            <p className="text-sm">Simplifying your prescription management.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><NavLink to="/about" className="hover:text-white dark:hover:text-white transition-colors">About Us</NavLink></li>
              <li><NavLink to="/features" className="hover:text-white dark:hover:text-white transition-colors">Features</NavLink></li>
              <li><NavLink to="/how-it-works" className="hover:text-white dark:hover:text-white transition-colors">How It Works</NavLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><NavLink to="/privacy" className="hover:text-white dark:hover:text-white transition-colors">Privacy Policy</NavLink></li>
              <li><NavLink to="/disclaimer" className="hover:text-white dark:hover:text-white transition-colors">Disclaimer</NavLink></li>
              <li><NavLink to="/contact" className="hover:text-white dark:hover:text-white transition-colors">Contact Us</NavLink></li>
            </ul>
          </div>
        </div>
        <p className="text-center text-green-200 dark:text-gray-400 text-sm mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-green-600 dark:border-gray-700">
          &copy; {new Date().getFullYear()} MediScan. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default MainLayout;