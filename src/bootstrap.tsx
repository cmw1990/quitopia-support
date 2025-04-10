import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Mount function for the standalone mode and module federation
export const mount = (el: Element | string, options = {}) => {
  const rootElement = typeof el === 'string' ? document.getElementById(el) : el;
  
  if (!rootElement) {
    console.error(`Element with id '${el}' not found`);
    return;
  }
  
  // Create a root for the specified container
  const root = ReactDOM.createRoot(rootElement);
  
  // Render the component
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Return an unmount function that uses the same root instance
  return {
    unmount: () => {
      root.unmount();
    }
  };
};

// For local development and standalone mode
if ((import.meta.env as any).DEV) {
  const rootElement = document.getElementById('_easier-focus-dev-root');
  
  if (rootElement) {
    mount(rootElement);
  }
} 

// Export for module federation
export default { mount }; 