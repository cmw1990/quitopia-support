
import React from 'react';
import AppRouter from './routes';
import '@/styles/globals.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <AppRouter />
    </div>
  );
};

export default App;
