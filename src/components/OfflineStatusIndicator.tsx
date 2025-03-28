import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOffline } from '@/context/OfflineContext';
import { Button } from '@/components/ui/button';

interface OfflineStatusIndicatorProps {
  variant?: 'minimal' | 'compact' | 'full';
  className?: string;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  variant = 'minimal',
  className = '',
}) => {
  const {
    isOnline,
    isOfflineModeEnabled,
    setOfflineModeEnabled,
    pendingSyncCount,
    syncInProgress,
    syncPendingChanges,
    offlineReady
  } = useOffline();

  // If we're still initializing IndexedDB, show a loading state
  if (!offlineReady) {
    return (
      <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        <span>Initializing...</span>
      </div>
    );
  }

  // Handle enabling/disabling offline mode
  const toggleOfflineMode = () => {
    setOfflineModeEnabled(!isOfflineModeEnabled);
  };

  // Force sync pending changes
  const handleSync = () => {
    if (!isOnline) {
      toast.error("Can't sync while offline");
      return;
    }
    
    syncPendingChanges();
    toast.info("Syncing changes...");
  };

  // Minimal variant just shows an icon
  if (variant === 'minimal') {
    return (
      <div 
        className={`flex items-center ${className}`}
        title={
          isOnline 
            ? isOfflineModeEnabled 
              ? "Offline mode enabled" 
              : "Online"
            : "You're offline"
        }
      >
        {isOnline ? (
          isOfflineModeEnabled ? (
            <CloudOff className="w-4 h-4 text-amber-500" />
          ) : (
            <Wifi className="w-4 h-4 text-emerald-500" />
          )
        ) : (
          <WifiOff className="w-4 h-4 text-amber-500" />
        )}
        
        {pendingSyncCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 rounded-full text-amber-800">
            {pendingSyncCount}
          </span>
        )}
      </div>
    );
  }

  // Compact variant shows icon + text
  if (variant === 'compact') {
    return (
      <div className={`flex items-center text-xs ${className}`}>
        {isOnline ? (
          isOfflineModeEnabled ? (
            <>
              <CloudOff className="w-3 h-3 mr-1 text-amber-500" />
              <span className="text-amber-600">Offline Mode</span>
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3 mr-1 text-emerald-500" />
              <span className="text-emerald-600">Online</span>
            </>
          )
        ) : (
          <>
            <WifiOff className="w-3 h-3 mr-1 text-amber-500" />
            <span className="text-amber-600">Offline</span>
          </>
        )}
        
        {pendingSyncCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 rounded-full text-amber-800">
            {pendingSyncCount}
          </span>
        )}
      </div>
    );
  }

  // Full variant shows all information + actions
  return (
    <div className={`rounded-md p-2 ${className} ${
      isOnline
        ? isOfflineModeEnabled
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-emerald-50 border border-emerald-200'
        : 'bg-amber-50 border border-amber-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isOnline ? (
            isOfflineModeEnabled ? (
              <>
                <CloudOff className="w-4 h-4 mr-2 text-amber-500" />
                <span className="text-amber-700 font-medium">Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2 text-emerald-500" />
                <span className="text-emerald-700 font-medium">Online</span>
              </>
            )
          ) : (
            <>
              <WifiOff className="w-4 h-4 mr-2 text-amber-500" />
              <span className="text-amber-700 font-medium">Offline</span>
            </>
          )}
          
          {pendingSyncCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 rounded-full text-amber-800">
              {pendingSyncCount} pending {pendingSyncCount === 1 ? 'change' : 'changes'}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {isOnline && (
            <Button
              size="sm"
              variant="outline"
              className={
                isOfflineModeEnabled
                  ? "h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                  : "h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              }
              onClick={toggleOfflineMode}
            >
              {isOfflineModeEnabled ? (
                <>
                  <Cloud className="w-3 h-3 mr-1" />
                  Go Online
                </>
              ) : (
                <>
                  <CloudOff className="w-3 h-3 mr-1" />
                  Go Offline
                </>
              )}
            </Button>
          )}
          
          {pendingSyncCount > 0 && isOnline && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={handleSync}
              disabled={syncInProgress}
            >
              {syncInProgress ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Cloud className="w-3 h-3 mr-1" />
                  Sync Now
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineStatusIndicator;