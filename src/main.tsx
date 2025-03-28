import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './utils/consoleLogger'; // Import console logger to capture errors
import MissionFreshApp from './MissionFreshApp';

// For Module Federation - expose the MissionFreshApp component
export { default as MissionFreshApp } from './MissionFreshApp';

// Only render in development mode - in production, MissionFreshApp will be imported by the host
if (import.meta.env.DEV) {
  const rootElement = document.getElementById('_mission-fresh-dev-root');
  
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <MissionFreshApp />
      </React.StrictMode>
    );
  } else {
    console.error('Root element with ID "_mission-fresh-dev-root" not found');
  }
} 
