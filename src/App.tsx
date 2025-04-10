
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
};

export default App;
