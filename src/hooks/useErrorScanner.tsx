import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import errorScanner, { ErrorScanResult } from '../utils/errorScanner';

/**
 * Hook to automatically scan for errors as the user navigates through different routes.
 * 
 * @param {Object} options - Configuration options for the error scanner
 * @param {boolean} options.automaticScanning - Whether to automatically scan when the route changes
 * @param {number} options.scanInterval - If set, performs periodic scans at the specified interval in ms
 * @param {boolean} options.consoleOutput - Whether to output scan results to the console
 * @returns Object with scan results and methods to control scanning
 */
export const useErrorScanner = ({
  automaticScanning = false,
  scanInterval = 60000,
  consoleOutput = false
}: {
  automaticScanning?: boolean;
  scanInterval?: number;
  consoleOutput?: boolean;
} = {}) => {
  const [scanResults, setScanResults] = useState<ErrorScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<Date | null>(null);
  const location = useLocation();
  
  // Perform a scan and update state
  const performScan = () => {
    setIsScanning(true);
    try {
      const result = errorScanner.scanForErrors();
      
      if (consoleOutput) {
        errorScanner.logErrorScanResults(result);
      }
      
      setScanResults(prev => {
        // Replace any existing results for this path
        const filtered = prev.filter(r => r.path !== result.path);
        return [...filtered, result];
      });
      
      setLastScanned(new Date());
    } catch (error) {
      console.error('Error during error scanning:', error);
    } finally {
      setIsScanning(false);
    }
  };
  
  // Scan when route changes if automatic scanning is enabled
  useEffect(() => {
    if (automaticScanning) {
      performScan();
    }
  }, [location.pathname, automaticScanning]);
  
  // Set up interval scanning if enabled
  useEffect(() => {
    if (scanInterval > 0 && automaticScanning) {
      const intervalId = setInterval(performScan, scanInterval);
      return () => clearInterval(intervalId);
    }
  }, [scanInterval, automaticScanning]);
  
  // Create summary of all errors
  const getErrorSummary = () => {
    const totalErrors = scanResults.reduce((sum, result) => sum + result.errors.length, 0);
    
    const countBySeverity = scanResults.reduce((acc, result) => {
      result.errors.forEach(error => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalErrors,
      critical: countBySeverity.critical || 0,
      high: countBySeverity.high || 0,
      medium: countBySeverity.medium || 0,
      low: countBySeverity.low || 0
    };
  };
  
  // Clear results for a specific path or all results
  const clearResults = (path?: string) => {
    if (path) {
      setScanResults(prev => prev.filter(r => r.path !== path));
    } else {
      setScanResults([]);
    }
  };
  
  return {
    scanResults,
    lastScanned,
    isScanning,
    performScan,
    clearResults,
    errorSummary: getErrorSummary()
  };
};

export default useErrorScanner; 