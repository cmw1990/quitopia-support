import React, { createContext, useContext, useEffect, useState } from 'react';

export type AvailableThemes = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: AvailableThemes;
  storageKey?: string;
}

interface ThemeContextValue {
  theme: AvailableThemes;
  setTheme: (theme: AvailableThemes) => void;
  resolvedTheme: 'light' | 'dark';
}

const initialValue: ThemeContextValue = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
};

const ThemeContext = createContext<ThemeContextValue>(initialValue);

// CSS variables for the theme
const lightThemeVars = {
  '--color-primary': '138, 92, 247',
  '--color-primary-light': '169, 142, 250',
  '--color-primary-dark': '110, 70, 195',
  '--color-secondary': '245, 158, 11',
  '--color-secondary-light': '251, 191, 36',
  '--color-secondary-dark': '217, 119, 6',
  '--color-accent': '59, 130, 246',
  '--color-accent-light': '96, 165, 250',
  '--color-success': '16, 185, 129',
  '--color-warning': '245, 158, 11',
  '--color-error': '239, 68, 68',
  '--color-info': '59, 130, 246',
  '--color-background': '255, 255, 255',
  '--color-surface': '248, 250, 252',
  '--color-text-primary': '15, 23, 42',
  '--color-text-secondary': '51, 65, 85',
  '--color-text-tertiary': '100, 116, 139',
  '--color-text-disabled': '148, 163, 184',
  '--background': '0 0% 100%',
  '--foreground': '222.2 84% 4.9%',
  '--card': '0 0% 100%',
  '--card-foreground': '222.2 84% 4.9%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '222.2 84% 4.9%',
  '--primary': '222.2 47.4% 11.2%',
  '--primary-foreground': '210 40% 98%',
  '--secondary': '210 40% 96.1%',
  '--secondary-foreground': '222.2 47.4% 11.2%',
  '--muted': '210 40% 96.1%',
  '--muted-foreground': '215.4 16.3% 46.9%',
  '--accent': '210 40% 96.1%',
  '--accent-foreground': '222.2 47.4% 11.2%',
  '--destructive': '0 84.2% 60.2%',
  '--destructive-foreground': '210 40% 98%',
  '--border': '214.3 31.8% 91.4%',
  '--input': '214.3 31.8% 91.4%',
  '--ring': '222.2 84% 4.9%',
  '--radius': '0.5rem'
};

const darkThemeVars = {
  '--color-primary': '138, 92, 247',
  '--color-primary-light': '169, 142, 250',
  '--color-primary-dark': '110, 70, 195',
  '--color-secondary': '245, 158, 11',
  '--color-secondary-light': '251, 191, 36',
  '--color-secondary-dark': '217, 119, 6',
  '--color-accent': '59, 130, 246',
  '--color-accent-light': '96, 165, 250',
  '--color-background': '17, 24, 39',
  '--color-surface': '31, 41, 55',
  '--color-text-primary': '248, 250, 252',
  '--color-text-secondary': '226, 232, 240',
  '--color-text-tertiary': '148, 163, 184',
  '--color-text-disabled': '100, 116, 139',
  '--background': '222.2 84% 4.9%',
  '--foreground': '210 40% 98%',
  '--card': '222.2 84% 4.9%',
  '--card-foreground': '210 40% 98%',
  '--popover': '222.2 84% 4.9%',
  '--popover-foreground': '210 40% 98%',
  '--primary': '210 40% 98%',
  '--primary-foreground': '222.2 47.4% 11.2%',
  '--secondary': '217.2 32.6% 17.5%',
  '--secondary-foreground': '210 40% 98%',
  '--muted': '217.2 32.6% 17.5%',
  '--muted-foreground': '215 20.2% 65.1%',
  '--accent': '217.2 32.6% 17.5%',
  '--accent-foreground': '210 40% 98%',
  '--destructive': '0 62.8% 30.6%',
  '--destructive-foreground': '210 40% 98%',
  '--border': '217.2 32.6% 17.5%',
  '--input': '217.2 32.6% 17.5%',
  '--ring': '212.7 26.8% 83.9%'
};

function setThemeVariables(isDark: boolean) {
  const vars = isDark ? darkThemeVars : lightThemeVars;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<AvailableThemes>(
    () => (localStorage.getItem(storageKey) as AvailableThemes) || defaultTheme
  );
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDark = e.matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
      
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        setThemeVariables(isDark);
      }
    };
    
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    handleMediaChange(darkModeMediaQuery);
    darkModeMediaQuery.addEventListener('change', handleMediaChange);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem(storageKey, theme);
    
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && resolvedTheme === 'dark');
    
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    setThemeVariables(isDark);
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        isDark ? '#111827' : '#ffffff'
      );
    }
  }, [theme, storageKey, resolvedTheme]);
  
  const value = {
    theme,
    setTheme,
    resolvedTheme,
  };
  
  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};