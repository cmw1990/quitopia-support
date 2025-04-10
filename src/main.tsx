import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { HelmetProvider } from 'react-helmet-async';
import '@/styles/globals.css';
import '@/styles/fullcalendar-custom.css';

// Clear console in development mode
if (import.meta.env.DEV) {
  console.clear();
  console.log('🚀 EasierFocus starting in development mode...');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
