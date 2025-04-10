/**
 * Theme configuration for Easier Focus application
 * This file defines colors, spacing, and other design tokens for consistent styling
 */

// Primary color palette - Purple theme
export const colors = {
  // Base theme colors
  primary: {
    DEFAULT: '#8b5cf6', // Purple-500
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  
  secondary: {
    DEFAULT: '#a78bfa', // Purple-400
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  
  accent: {
    DEFAULT: '#f59e0b', // Amber-500
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  muted: {
    DEFAULT: '#9ca3af', // Gray-400
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  destructive: {
    DEFAULT: '#ef4444', // Red-500
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  // Feature-specific colors
  sleep: {
    DEFAULT: '#3b82f6', // Blue-500
    light: '#93c5fd', // Blue-300
    dark: '#1d4ed8', // Blue-700
  },
  
  energy: {
    DEFAULT: '#f59e0b', // Amber-500
    light: '#fcd34d', // Amber-300
    dark: '#b45309', // Amber-700
  },
  
  focus: {
    DEFAULT: '#8b5cf6', // Purple-500
    light: '#c084fc', // Purple-400
    dark: '#6d28d9', // Purple-700
  },
  
  social: {
    DEFAULT: '#10b981', // Green-500
    light: '#6ee7b7', // Green-300
    dark: '#047857', // Green-700
  },
  
  health: {
    DEFAULT: '#ef4444', // Red-500
    light: '#fca5a5', // Red-300
    dark: '#b91c1c', // Red-700
  },
};

// Font configuration
export const fonts = {
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

// Border radius configuration
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Shadow configuration
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// Animation configuration
export const animations = {
  spin: 'spin 1s linear infinite',
  ping: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
};

// Transition configuration
export const transitions = {
  DEFAULT: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Z-index configuration
export const zIndices = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
};

// Spacing configuration (consistent with Tailwind)
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Breakpoint configuration
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Gradient presets
export const gradients = {
  primary: 'linear-gradient(to right, #8b5cf6, #6d28d9)',
  secondary: 'linear-gradient(to right, #a78bfa, #8b5cf6)',
  accent: 'linear-gradient(to right, #f59e0b, #d97706)',
  destructive: 'linear-gradient(to right, #ef4444, #b91c1c)',
  sleep: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
  energy: 'linear-gradient(to right, #f59e0b, #b45309)',
  focus: 'linear-gradient(to right, #8b5cf6, #6d28d9)',
  social: 'linear-gradient(to right, #10b981, #047857)',
  health: 'linear-gradient(to right, #ef4444, #b91c1c)',
};

// Export all as theme object
export const theme = {
  colors,
  fonts,
  borderRadius,
  shadows,
  animations,
  transitions,
  zIndices,
  spacing,
  breakpoints,
  gradients,
};

export default theme; 