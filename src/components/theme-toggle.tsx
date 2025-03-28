import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../hooks/useTheme';
import { hapticFeedback } from '../utils/hapticFeedback';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    hapticFeedback.light();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'dark' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 