
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/lib/ThemeProvider';
import '@/styles/globals.css';

// Make sure the DOM is fully loaded before attempting to render
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found. Make sure there is a div with id "root" in your HTML');
  } else {
    // Create root and render
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ThemeProvider defaultTheme="system">
          <App />
        </ThemeProvider>
      </React.StrictMode>
    );
  }
});
