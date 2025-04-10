
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/lib/ThemeProvider';
import '@/styles/globals.css';

// Simple direct approach to rendering
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found. Make sure there is a div with id "root" in your HTML');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
