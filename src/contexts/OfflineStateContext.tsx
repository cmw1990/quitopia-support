import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OfflineStateContextType {
  isOffline: boolean;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

const OfflineStateContext = createContext<OfflineStateContextType>({
  isOffline: false,
  lastOnlineAt: null,
  lastOfflineAt: null,
  connectionQuality: 'excellent',
});

export const useOfflineState = () => useContext(OfflineStateContext);

interface OfflineStateProviderProps {
  children: ReactNode;
}

export const OfflineStateProvider: React.FC<OfflineStateProviderProps> = ({ children }) => {
  const [offlineState, setOfflineState] = useState<OfflineStateContextType>({
    isOffline: !navigator.onLine,
    lastOnlineAt: navigator.onLine ? new Date() : null,
    lastOfflineAt: !navigator.onLine ? new Date() : null,
    connectionQuality: 'excellent',
  });

  useEffect(() => {
    const handleOnline = () => {
      setOfflineState(prev => ({
        ...prev,
        isOffline: false,
        lastOnlineAt: new Date(),
        connectionQuality: 'good',
      }));
    };

    const handleOffline = () => {
      setOfflineState(prev => ({
        ...prev,
        isOffline: true,
        lastOfflineAt: new Date(),
        connectionQuality: 'offline',
      }));
    };

    // Check connection quality using NetworkInformation API if available
    const checkConnectionQuality = () => {
      if ('connection' in navigator && navigator.connection) {
        const connection = navigator.connection as any;
        
        if (connection.downlink !== undefined) {
          let quality: 'excellent' | 'good' | 'poor' = 'poor';
          
          if (connection.downlink >= 5) {
            quality = 'excellent';
          } else if (connection.downlink >= 2) {
            quality = 'good';
          }
          
          setOfflineState(prev => ({
            ...prev,
            connectionQuality: prev.isOffline ? 'offline' : quality,
          }));
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check connection quality initially and every 30 seconds
    checkConnectionQuality();
    const intervalId = setInterval(checkConnectionQuality, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <OfflineStateContext.Provider value={offlineState}>
      {children}
    </OfflineStateContext.Provider>
  );
}; 