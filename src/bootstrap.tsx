import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import MissionFreshApp from './MissionFreshApp';
import { MountConfig } from './index';

// Create a context for configuration
export const ConfigContext = React.createContext<MountConfig>({});

// Root component with error boundary
const Root = ({ config }: { config: MountConfig }) => {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong in Mission Fresh app</div>}
      onError={config.onError}
    >
      <ConfigContext.Provider value={config}>
        <BrowserRouter basename={config.basePath || '/mission-fresh'}>
          <MissionFreshApp session={config.session} supabaseClient={config.supabaseClient} />
        </BrowserRouter>
      </ConfigContext.Provider>
    </ErrorBoundary>
  );
};

// Map of container elements to root instances
const rootsMap = new Map<HTMLElement, any>();

// Bootstrap function for mounting the app
export const bootstrap = (container: HTMLElement, config: MountConfig) => {
  if (rootsMap.has(container)) {
    console.warn('Mission Fresh app is already mounted in this container');
    return;
  }

  const root = createRoot(container);
  rootsMap.set(container, root);
  
  root.render(<Root config={config} />);
  
  console.log('Mission Fresh app mounted successfully');
};

// Unmount function for cleaning up
export const unmount = (container: HTMLElement) => {
  const root = rootsMap.get(container);
  
  if (root) {
    root.unmount();
    rootsMap.delete(container);
    console.log('Mission Fresh app unmounted successfully');
  } else {
    console.warn('No Mission Fresh app instance found in this container');
  }
}; 
