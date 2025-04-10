
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/lib/ThemeProvider';
import '@/styles/globals.css';

// Create a reliable rendering function
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found in the document');
}
