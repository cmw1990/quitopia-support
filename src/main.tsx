
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

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
