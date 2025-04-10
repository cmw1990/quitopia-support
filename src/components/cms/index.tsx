import React from 'react';
import { Outlet } from 'react-router-dom';

const CMSTestWrapper: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <h1 className="text-xl font-bold">CMS Testing Environment</h1>
        <p className="text-sm text-muted-foreground">
          These are additional preview/edit tools. They do not replace the Well-Charged app.
        </p>
      </header>
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default CMSTestWrapper;
