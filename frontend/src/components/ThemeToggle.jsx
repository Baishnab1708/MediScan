import React from 'react';
import { Expand } from '@theme-toggles/react';
import '@theme-toggles/react/css/Expand.css';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="theme-switch-wrapper flex items-center gap-2">
      <Expand
        toggled={isDarkMode}
        onToggle={toggleTheme}
        duration={650}
        className="scale-[1.5]"
      />
    </div>
  );
};

export default ThemeToggle;
