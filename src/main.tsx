
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/lib/ThemeProvider';
import '@/styles/globals.css';

// Create a more reliable rendering function
const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found in the document');
}
