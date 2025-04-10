
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Wrap the initialization in a function to ensure it runs after DOM is fully loaded
function initializeApp() {
  // Find the root element
  const rootElement = document.getElementById('root');

  // Check if element exists
  if (!rootElement) {
    console.error('Root element not found');
  } else {
    // Create a root
    const root = createRoot(rootElement);
    
    // Render the app
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

// Ensure the app initializes after the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
