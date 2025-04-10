import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '../components/ui/toast';

// Theme mode types
type ThemeMode = 'light' | 'dark' | 'system';

// Accessibility options
interface AccessibilityOptions {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

// Theme state interface
interface ThemeState {
  mode: ThemeMode;
  accessibility: AccessibilityOptions;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  updateAccessibility: (options: Partial<AccessibilityOptions>) => void;
  resetToDefaultTheme: () => void;
}

// Default theme configuration
const DEFAULT_THEME_CONFIG = {
  mode: 'system' as ThemeMode,
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium' as const
  }
};

const ThemeContext = createContext<ThemeState | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_THEME_CONFIG.mode);
  const [accessibility, setAccessibility] = useState<AccessibilityOptions>(
    DEFAULT_THEME_CONFIG.accessibility
  );

  // Apply theme and accessibility settings
  useEffect(() => {
    // Theme mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDarkMode = 
      mode === 'dark' || 
      (mode === 'system' && prefersDarkMode);

    document.documentElement.classList.toggle('dark', shouldUseDarkMode);

    // Accessibility settings
    document.documentElement.classList.toggle('high-contrast', accessibility.highContrast);
    document.documentElement.classList.toggle('reduce-motion', accessibility.reducedMotion);

    // Font size
    document.documentElement.style.setProperty(
      '--font-size-multiplier', 
      getFontSizeMultiplier(accessibility.fontSize)
    );
  }, [mode, accessibility]);

  // Helper function to get font size multiplier
  const getFontSizeMultiplier = (fontSize: 'small' | 'medium' | 'large') => {
    switch (fontSize) {
      case 'small': return '0.8';
      case 'medium': return '1';
      case 'large': return '1.2';
    }
  };

  // Toggle between light and dark modes
  const toggleTheme = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);

    toast({
      title: 'Theme Changed',
      description: `Switched to ${newMode} mode`,
      variant: 'default'
    });
  }, [mode]);

  // Set theme mode explicitly
  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);

    toast({
      title: 'Theme Updated',
      description: `Theme set to ${newMode} mode`,
      variant: 'default'
    });
  }, []);

  // Update accessibility options
  const updateAccessibility = useCallback((options: Partial<AccessibilityOptions>) => {
    setAccessibility(prev => ({
      ...prev,
      ...options
    }));

    toast({
      title: 'Accessibility Settings Updated',
      description: 'Your display preferences have been applied',
      variant: 'default'
    });
  }, []);

  // Reset to default theme configuration
  const resetToDefaultTheme = useCallback(() => {
    setMode(DEFAULT_THEME_CONFIG.mode);
    setAccessibility(DEFAULT_THEME_CONFIG.accessibility);

    toast({
      title: 'Theme Reset',
      description: 'Restored default theme and accessibility settings',
      variant: 'default'
    });
  }, []);

  const value = {
    mode,
    accessibility,
    toggleTheme,
    setThemeMode,
    updateAccessibility,
    resetToDefaultTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};