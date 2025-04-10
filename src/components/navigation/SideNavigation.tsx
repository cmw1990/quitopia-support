import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const SideNavigation: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav>
      {user && (
        <div>
          {/* Side navigation content for authenticated users */}
        </div>
      )}
    </nav>
  );
};

export default SideNavigation;