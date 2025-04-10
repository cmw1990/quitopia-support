
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Define a clean initialization function to ensure proper setup
function startApp() {
  try {
    const container = document.getElementById('root');
    
    if (!container) {
      console.error('Root element not found');
      return;
    }
    
    // Create root with error handling
    const root = createRoot(container);
    
    // Render with error boundary
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('Application successfully mounted');
  } catch (error) {
    console.error('Failed to initialize React application:', error);
  }
}

// Use a more robust way to ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all scripts are properly loaded
    setTimeout(startApp, 50);
  });
} else {
  // Add a small delay for already loaded DOM
  setTimeout(startApp, 50);
}
