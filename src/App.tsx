import React from 'react';
import AppRouter from './routes';
// Removed duplicate providers, they are in main.tsx
// import { ThemeProvider } from '@/lib/ThemeProvider'; 
// import { HelmetProvider } from 'react-helmet-async';
import '@/styles/globals.css';
import '@/styles/fullcalendar-custom.css';

const App: React.FC = () => {
  // Simplified: Just render the AppRouter
  return <AppRouter />;
};

export default App;
