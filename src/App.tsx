
import React from 'react';
import AppRouter from './routes';
import '@/styles/globals.css';

const App: React.FC = () => {
  console.log('App component rendering');
  return <AppRouter />;
};

export default App;
