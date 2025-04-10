
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes';
import '@/styles/globals.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-container min-h-screen bg-background">
        <AppRouter />
      </div>
    </BrowserRouter>
  );
};

export default App;
