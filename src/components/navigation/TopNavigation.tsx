import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const TopNavigation: React.FC = () => {
  const { user, logout } = useAuth();

  // Rest of the component implementation
  return (
    <nav>
      {user && (
        <button onClick={logout}>Logout</button>
      )}
    </nav>
  );
};

export default TopNavigation;