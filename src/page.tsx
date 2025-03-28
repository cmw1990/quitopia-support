import React from 'react';
import { MissionFreshApp } from './MissionFreshApp';
import { useAuth } from './components/AuthProvider';

export default function MissionFreshPage() {
  // Get session but don't wait for it to be fully verified
  const { session } = useAuth();
  
  // Render the app immediately
  return (
    <div className="min-h-screen bg-background">
      <MissionFreshApp session={session} />
    </div>
  );
}
