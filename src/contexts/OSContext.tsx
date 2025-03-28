import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OSContextType {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  userAgent: string;
}

const OSContext = createContext<OSContextType>({
  isIOS: false,
  isAndroid: false,
  isMobile: false,
  isDesktop: true,
  isSafari: false,
  isChrome: false,
  isFirefox: false,
  userAgent: '',
});

export const useOS = () => useContext(OSContext);

interface OperatingSystemProviderProps {
  children: ReactNode;
}

export const OperatingSystemProvider: React.FC<OperatingSystemProviderProps> = ({ children }) => {
  const [osInfo, setOsInfo] = useState<OSContextType>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isDesktop: true,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    userAgent: '',
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      const isMobile = /Mobi/i.test(userAgent) || isIOS || isAndroid;
      const isDesktop = !isMobile;
      
      const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
      const isChrome = /Chrome/i.test(userAgent);
      const isFirefox = /Firefox/i.test(userAgent);
      
      setOsInfo({
        isIOS,
        isAndroid,
        isMobile,
        isDesktop,
        isSafari,
        isChrome,
        isFirefox,
        userAgent,
      });
    }
  }, []);

  return (
    <OSContext.Provider value={osInfo}>
      {children}
    </OSContext.Provider>
  );
}; 