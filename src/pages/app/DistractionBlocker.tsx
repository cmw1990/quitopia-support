
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const DistractionBlocker: React.FC = () => {
  const [isBlocking, setIsBlocking] = useState(false);
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Distraction Blocker</h1>
      
      <div className="border rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Focus Mode</h2>
        <p className="mb-4">
          Block distracting websites and applications to help you maintain focus 
          during important work or study sessions.
        </p>
        <Button 
          onClick={() => setIsBlocking(!isBlocking)}
          variant={isBlocking ? "destructive" : "default"}
          className="w-full"
        >
          {isBlocking ? 'Stop Blocking Distractions' : 'Start Blocking Distractions'}
        </Button>
      </div>
      
      <div className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Distraction Settings</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span>Social Media</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>News Websites</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Video Streaming</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex justify-between items-center py-2">
            <span>Gaming Sites</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistractionBlocker;
