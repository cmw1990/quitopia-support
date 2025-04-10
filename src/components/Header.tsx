// micro-frontends/easier-focus/src/components/Header.tsx
import React from 'react';
import { SessionData } from '../api/easierFocusApiClient';

interface HeaderProps {
  session: SessionData;
  onSignOut: () => void;
}

const Header = ({ session, onSignOut }: HeaderProps) => {
  return (
    <header>
      <h1>Easier Focus</h1>
      {session ? (
        <div>
          {/* Placeholder for user information */}
          <span>User: {session.user?.email || 'Loading...'}</span>
          <button onClick={onSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          {/* Placeholder for login/signup links */}
          <span>Not signed in</span>
        </div>
      )}
    </header>
  );
};

export default Header;
