
import React from 'react';
import AppRouter from './routes';
// Removed duplicate providers, they are in main.tsx
import '@/styles/globals.css';

const App: React.FC = () => {
  return <AppRouter />;
};

export default App;
