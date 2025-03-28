import React, { useState, useEffect } from 'react';
import { useOffline } from '../contexts/OfflineContext';
import { WifiOff, Wifi, CloudOff, Cloud, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Enhanced OfflineIndicator Component
 * 
 * Provides improved visual feedback for offline/online status
 * with detailed sync information and animations
 * 
 * Part of Mobile Experience & Offline Mode Enhancement (Priority 2)
 */
interface OfflineIndicatorProps {
  position?: string;
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'bottom-right',
  className = ''
}) => {
  const { 
    isOnline, 
    isOfflineModeEnabled, 
    setOfflineModeEnabled,
    syncPendingChanges,
    pendingSyncCount,
    syncStatus,
    lastSyncTime
  } = useOffline();
  
  const [expanded, setExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [statusChange, setStatusChange] = useState<'online' | 'offline' | null>(null);
  
  // Handle online/offline status changes with notification
  useEffect(() => {
    const currentStatus = isOnline ? 'online' : 'offline';
    
    if (statusChange !== null && statusChange !== currentStatus) {
      // Show toast notification when status changes
      setShowToast(true);
      
      // Provide haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(isOnline ? [10, 50, 10] : 100);
      }
      
      // Hide toast after 3 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    setStatusChange(currentStatus);
  }, [isOnline, statusChange]);
  
  // Calculate position classes
  const getPositionClasses = () => {
    switch(position) {
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-40';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-40';
      case 'top-right':
        return 'fixed top-4 right-4 z-40';
      case 'top-left':
        return 'fixed top-4 left-4 z-40';
      case 'bottom-center':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40';
      case 'top-center':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-40';
      default:
        return 'fixed bottom-4 right-4 z-40';
    }
  };
  
  return (
    <>
      {/* Status change toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg ${
              isOnline 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span className="font-medium">
                {isOnline ? 'Back online' : 'You\'re offline'}
              </span>
            </div>
            <p className="text-xs mt-1">
              {isOnline 
                ? 'Your changes will sync automatically.' 
                : 'Changes will be saved locally and synced when you reconnect.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main indicator */}
      <div className={`${getPositionClasses()} ${className} relative ${expanded ? 'w-full max-w-sm' : 'w-auto'}`}>
        <motion.div
          layout
          animate={{ 
            height: expanded ? 'auto' : '40px',
            width: expanded ? '100%' : 'auto'
          }}
          className={`rounded-lg shadow-md ${
            expanded 
              ? 'p-4 bg-card' 
              : 'px-3 py-2 cursor-pointer'
          } ${
            isOnline 
              ? 'border border-green-200 dark:border-green-800' 
              : 'border border-amber-200 dark:border-amber-800'
          }`}
          onClick={() => !expanded && setExpanded(true)}
        >
          {/* Header */}
          <motion.div 
            layout="position" 
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="font-medium">Offline</span>
                </div>
              )}
              
              {!expanded && pendingSyncCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.5rem] text-center">
                  {pendingSyncCount}
                </span>
              )}
            </div>
            
            {expanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
              >
                Close
              </Button>
            )}
          </motion.div>
          
          {/* Expanded content */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-4"
            >
              {/* Sync status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Sync Status</span>
                  {pendingSyncCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {pendingSyncCount} pending {pendingSyncCount === 1 ? 'change' : 'changes'}
                    </span>
                  )}
                </div>
                
                <div className="p-3 rounded-md bg-muted/50 flex items-center gap-3">
                  {isOnline ? (
                    pendingSyncCount > 0 ? (
                      <>
                        <CloudOff className="h-5 w-5 text-amber-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Pending changes</p>
                          <p className="text-xs text-muted-foreground">
                            {syncStatus.inProgress ? 'Syncing...' : 'Ready to sync'}
                          </p>
                        </div>
                        {syncStatus.inProgress ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    syncPendingChanges();
                                  }}
                                >
                                  Sync Now
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sync all pending changes</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </>
                    ) : (
                      <>
                        <Cloud className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Fully synced</p>
                          {lastSyncTime && (
                            <p className="text-xs text-muted-foreground">
                              Last sync: {formatDistanceToNow(new Date(lastSyncTime))} ago
                            </p>
                          )}
                        </div>
                      </>
                    )
                  ) : (
                    <>
                      <CloudOff className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">Offline mode</p>
                        <p className="text-xs text-muted-foreground">
                          Changes will be saved locally
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Sync progress */}
              {syncStatus.inProgress && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Sync progress</span>
                  </div>
                  <Progress value={50} className="h-1 w-full" />
                </div>
              )}
              
              {/* Offline mode toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Offline mode</p>
                  <p className="text-xs text-muted-foreground">
                    {isOfflineModeEnabled 
                      ? 'Always save changes locally first' 
                      : 'Automatically sync when online'}
                  </p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isOfflineModeEnabled}
                    onChange={(e) => setOfflineModeEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}; 