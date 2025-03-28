/**
 * OfflineStatusBanner Component
 * 
 * Displays the current offline/online status and sync progress
 * Provides controls for manual sync and offline mode toggle
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offlineStorage } from '../../services/OfflineStorageService';
import * as Icons from 'react-icons/md';
import * as FiIcons from 'react-icons/fi';

interface OfflineStatusBannerProps {
  position?: 'top' | 'bottom';
  autoDismiss?: boolean;
  dismissTimeout?: number;
}

const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({
  position = 'top',
  autoDismiss = true,
  dismissTimeout = 5000
}) => {
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ pending: 0, total: 0, failed: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [dismissTimer, setDismissTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize and cleanup effects
  useEffect(() => {
    // Add offline status listener
    offlineStorage.addOfflineStatusListener(handleOfflineStatusChange);
    
    // Update sync status initially and on interval
    updateSyncStatus();
    const statusInterval = setInterval(updateSyncStatus, 10000);
    
    return () => {
      offlineStorage.removeOfflineStatusListener(handleOfflineStatusChange);
      clearInterval(statusInterval);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, []);

  // Show banner whenever offline status changes
  useEffect(() => {
    setShowBanner(true);
    
    // Auto dismiss if connected and no pending syncs
    if (autoDismiss && !isOffline && syncStatus.pending === 0) {
      if (dismissTimer) clearTimeout(dismissTimer);
      
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, dismissTimeout);
      
      setDismissTimer(timer);
    }
  }, [isOffline, syncStatus.pending]);

  // Handle offline status changes
  const handleOfflineStatusChange = (status: boolean) => {
    setIsOffline(status);
    
    // Always show banner when status changes
    setShowBanner(true);
    setIsExpanded(status); // Auto expand when offline
    
    // Update sync status after status change
    updateSyncStatus();
  };

  // Update sync status from service
  const updateSyncStatus = async () => {
    const status = await offlineStorage.getSyncStatus();
    setSyncStatus(status);
    
    // Update last sync time
    const lastSync = offlineStorage.getLastSyncTime();
    if (lastSync > 0) {
      setLastSyncTime(new Date(lastSync));
    }
  };

  // Handle manual sync button press
  const handleSyncNow = async () => {
    if (isSyncing || isOffline) return;
    
    setIsSyncing(true);
    setProgress(0);
    
    try {
      await offlineStorage.syncData((total, completed) => {
        const progressPercent = Math.round((completed / total) * 100);
        setProgress(progressPercent);
      });
      
      // Update status after sync
      await updateSyncStatus();
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle cancel sync
  const handleCancelSync = () => {
    offlineStorage.cancelSync();
    setIsSyncing(false);
  };

  // Toggle offline mode
  const handleToggleOfflineMode = () => {
    const currentMode = offlineStorage.isOfflineModeEnabled();
    offlineStorage.toggleOfflineMode(!currentMode);
  };

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed left-0 right-0 z-50 m-4 ${
          position === 'top' ? 'top-0' : 'bottom-0'
        } flex flex-col items-center`}
      >
        <motion.div
          className={`rounded-lg shadow-lg max-w-md w-full overflow-hidden ${
            isOffline ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
          } border p-0`}
          layout
        >
          {/* Header with status */}
          <div 
            className={`px-4 py-3 flex justify-between items-center cursor-pointer ${
              isOffline ? 'bg-orange-100' : 'bg-blue-50'
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center">
              {isOffline ? (
                <Icons.MdWifiOff className="text-orange-500 mr-2 text-xl" />
              ) : syncStatus.pending > 0 ? (
                <Icons.MdCloudSync className="text-blue-500 mr-2 text-xl" />
              ) : (
                <Icons.MdCloudDone className="text-green-500 mr-2 text-xl" />
              )}
              <span className={`font-semibold ${isOffline ? 'text-orange-700' : 'text-blue-700'}`}>
                {isOffline
                  ? 'You are offline'
                  : syncStatus.pending > 0
                  ? `${syncStatus.pending} changes to sync`
                  : 'All changes synced'}
              </span>
            </div>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowBanner(false);
              }}
            >
              &times;
            </button>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-3 border-t border-gray-200"
              >
                {/* Sync status details */}
                <div className="mb-3">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600">Last synced:</span>
                    <span className="font-medium">{formatLastSync()}</span>
                  </div>
                  
                  {syncStatus.failed > 0 && (
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-orange-600">Failed changes:</span>
                      <span className="font-medium text-orange-600">{syncStatus.failed}</span>
                    </div>
                  )}
                </div>

                {/* Sync progress bar */}
                {isSyncing && (
                  <div className="mb-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Syncing...</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-between gap-2">
                  {!isOffline ? (
                    <>
                      <button
                        className={`px-3 py-2 rounded text-sm flex-1 flex items-center justify-center gap-1 ${
                          isSyncing
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : syncStatus.pending > 0
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={isSyncing ? handleCancelSync : handleSyncNow}
                        disabled={!isSyncing && syncStatus.pending === 0}
                      >
                        {isSyncing ? (
                          <>
                            <span>Cancel</span>
                          </>
                        ) : (
                          <>
                            <Icons.MdCloudSync className="text-lg" />
                            <span>Sync now</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm flex-1 flex items-center justify-center gap-1"
                        onClick={handleToggleOfflineMode}
                      >
                        <Icons.MdCloudOff className="text-lg" />
                        <span>
                          {offlineStorage.isOfflineModeEnabled() ? 'Disable offline' : 'Enable offline'}
                        </span>
                      </button>
                    </>
                  ) : (
                    <div className="text-orange-600 text-sm px-3 py-2 bg-orange-50 rounded w-full text-center">
                      Waiting for connection to restore...
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineStatusBanner; 