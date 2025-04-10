import React, { useEffect, useState } from 'react';
import { Canvas } from './canvas/Canvas';
import { Toolbar } from './toolbar/Toolbar';
import { ComponentLibrary } from './library/ComponentLibrary';
import { PropertiesPanel } from './properties/PropertiesPanel';
import { NavigationTree } from './navigation/NavigationTree';
import { DatabasePanel } from './database/DatabasePanel';
import { Editor, Frame, Element } from '@craftjs/core';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/supabase-client';
import { lazy } from 'react';

// Import all our app components
const Dashboard = lazy(() => import("@/pages/app/Dashboard"));
const Focus = lazy(() => import("@/pages/Focus"));
const Sleep = lazy(() => import("@/pages/app/Sleep"));
const Exercise = lazy(() => import("@/pages/app/Exercise"));
const MentalHealth = lazy(() => import("@/pages/app/MentalHealth"));
const EnergyPlans = lazy(() => import("@/pages/app/EnergyPlans"));

// Create visual editor versions of our components
const PagePreview = ({ component: Component, path }: { component: React.ComponentType, path: string }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  
  return (
    <div className={`p-4 border rounded ${isActive ? 'border-primary' : 'border-border'}`}>
      <div className="text-sm text-muted-foreground mb-2">Path: {path}</div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component />
      </React.Suspense>
    </div>
  );
};

const RouteContainer = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Following our workspace rules for real data
    const fetchData = async () => {
      try {
        const { data: energyData, error } = await supabase
          .from('energy_data')
          .select('*')
          .limit(5);
        
        if (error) throw error;
        setData(energyData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 border rounded bg-card">
      <div className="text-sm text-muted-foreground mb-2">
        Connected to Supabase: {data ? '✅' : '⏳'}
      </div>
      {children}
    </div>
  );
};

const DevStudio: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Component Library & Navigation */}
      <div className="w-64 border-r border-border bg-card">
        <NavigationTree />
        <ComponentLibrary />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        <Toolbar />
        <div className="flex-1 bg-background">
          <Editor
            resolver={{
              RouteContainer,
              PagePreview,
              Dashboard,
              Focus,
              Sleep,
              Exercise,
              MentalHealth,
              EnergyPlans
            }}
            onRender={({ render }) => (
              <Frame>
                {render(
                  <Element canvas is={RouteContainer} custom={{ displayName: 'App Routes' }}>
                    <Element
                      canvas
                      is={PagePreview}
                      custom={{ 
                        displayName: 'Dashboard',
                        props: { component: Dashboard, path: '/app' }
                      }}
                    />
                    <Element
                      canvas
                      is={PagePreview}
                      custom={{ 
                        displayName: 'Focus',
                        props: { component: Focus, path: '/app/focus' }
                      }}
                    />
                    <Element
                      canvas
                      is={PagePreview}
                      custom={{ 
                        displayName: 'Sleep',
                        props: { component: Sleep, path: '/app/sleep' }
                      }}
                    />
                    {/* Add more routes as needed */}
                  </Element>
                )}
              </Frame>
            )}
          />
        </div>
      </div>

      {/* Right Sidebar - Properties & Database */}
      <div className="w-80 border-l border-border bg-card">
        <PropertiesPanel />
        <DatabasePanel />
      </div>
    </div>
  );
};

export default DevStudio;
