import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useOffline } from '../contexts/OfflineContext';
import { cn } from '../lib/utils';
import { hapticFeedback } from '../utils/hapticFeedback';

interface OfflineStatusBannerProps {
  className?: string;
  showOnlineStatus?: boolean;
}

/**
 * OfflineStatusBanner displays the current connection status and pending changes.
 * It allows users to manually sync when they're back online.
 */
export const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({ 
  className,
  showOnlineStatus = false
}) => {
  const { 
    isOnline, 
    hasPendingChanges, 
    pendingChangesCount, 
    isSyncing, 
    syncNow, 
    lastSyncTime 
  } = useOffline();
  
  // Don't show anything if online and no pending changes and not configured to show online status
  if (isOnline && !hasPendingChanges && !showOnlineStatus) {
    return null;
  }

  const handleSyncClick = async () => {
    hapticFeedback.medium();
    await syncNow();
  };
  
  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full overflow-hidden",
          isOnline ? "bg-green-50 dark:bg-green-900/20" : "bg-amber-50 dark:bg-amber-900/20",
          className
        )}
      >
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <FiIcons.FiWifi className="text-green-600 dark:text-green-400" />
            ) : (
              <FiIcons.FiWifiOff className="text-amber-600 dark:text-amber-400" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isOnline ? "text-green-800 dark:text-green-300" : "text-amber-800 dark:text-amber-300"
            )}>
              {isOnline 
                ? hasPendingChanges 
                  ? `Online · ${pendingChangesCount} change${pendingChangesCount !== 1 ? 's' : ''} pending` 
                  : "Online"
                : `Offline · ${pendingChangesCount} change${pendingChangesCount !== 1 ? 's' : ''} pending`
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {lastSyncTime && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Last synced: {formatLastSyncTime()}
              </span>
            )}
            
            {isOnline && hasPendingChanges && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={isSyncing}
                onClick={handleSyncClick}
                className={cn(
                  "flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium",
                  "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200",
                  "disabled:opacity-50"
                )}
              >
                {isSyncing ? (
                  <>
                    <FiIcons.FiRefreshCw className="animate-spin h-3 w-3" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <FiIcons.FiArrowUp className="h-3 w-3" />
                    <span>Sync now</span>
                  </>
                )}
              </motion.button>
            )}
            
            {isOnline && !hasPendingChanges && showOnlineStatus && (
              <div className="flex items-center space-x-1 text-xs text-green-800 dark:text-green-300">
                <FiIcons.FiCheckCircle className="h-3 w-3" />
                <span>All synced</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 