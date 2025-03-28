import React, { useState, useEffect } from 'react';
import { useOffline } from '../contexts/OfflineContext';
import { useAuth } from './AuthProvider';
import missionFreshApiClient from "../api/apiCompatibility";
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Save, 
  RefreshCw, 
  ArrowDownToLine, 
  CheckCircle, 
  XCircle, 
  AlertTriangle
} from 'lucide-react';
import { hapticFeedback } from '../utils/hapticFeedback';

const OfflineTest: React.FC = () => {
  const { isOnline, isOfflineModeEnabled, setOfflineModeEnabled, syncPendingChanges, pendingSyncCount } = useOffline();
  const { session } = useAuth();
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastSavedItem, setLastSavedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'save' | 'fetch' | 'sync'>('save');
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  useEffect(() => {
    // Auto-hide instructions after 5 seconds
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Method to simulate network toggling (disconnect/reconnect)
  const simulateNetworkToggle = () => {
    hapticFeedback.medium();
    if (isOnline) {
      alert('To simulate offline state:\n\n1. Open browser DevTools (F12 or Cmd+Option+I)\n2. Go to Network tab\n3. Check "Offline" checkbox\n\nThis will completely disable network connectivity in the browser.');
    } else {
      alert('To simulate online state:\n\n1. Open browser DevTools (F12 or Cmd+Option+I)\n2. Go to Network tab\n3. Uncheck "Offline" checkbox');
    }
  };

  // Save progress test
  const testSaveProgress = async () => {
    if (!session?.user?.id) {
      alert('You must be logged in to test this feature');
      return;
    }

    hapticFeedback.light();
    setLoading(true);
    setTestStatus('idle');
    
    try {
      const progressData = {
        id: uuidv4(), // Generate a new ID for testing
        user_id: session.user.id,
        date: new Date().toISOString().split('T')[0],
        smoke_free: true,
        craving_intensity: Math.floor(Math.random() * 10) + 1,
        mood: ['happy', 'calm', 'stressed', 'anxious'][Math.floor(Math.random() * 4)],
        notes: notes || `Test progress entry created at ${new Date().toLocaleTimeString()}`,
      };
      
      const result = await missionFreshApiClient.addProgressEntry(progressData, session);
      
      setLastSavedItem(result);
      setTestStatus('success');
      hapticFeedback.success();
    } catch (error) {
      console.error('Error saving progress:', error);
      setTestStatus('error');
      hapticFeedback.error();
      alert(`Failed to save progress: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Test fetching data
  const testFetchData = async () => {
    if (!session?.user?.id) {
      alert('You must be logged in to test this feature');
      return;
    }

    hapticFeedback.light();
    setLoading(true);
    setTestStatus('idle');
    
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const progressResponse = await missionFreshApiClient.getUserProgress(
        session.user.id,
        startDate,
        endDate,
        session
      );
      
      const entries = progressResponse?.progressEntries || [];
      
      setLastSavedItem({
        count: entries.length,
        entries: entries.slice(0, 3) // Just show the first 3 for UI simplicity
      });
      
      setTestStatus('success');
      hapticFeedback.success();
    } catch (error) {
      console.error('Error fetching progress:', error);
      setTestStatus('error');
      hapticFeedback.error();
      alert(`Failed to fetch progress: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Force sync
  const testForceSync = async () => {
    if (!isOnline) {
      hapticFeedback.warning();
      alert('Cannot sync while offline');
      return;
    }

    hapticFeedback.light();
    setLoading(true);
    setTestStatus('idle');
    
    try {
      await syncPendingChanges();
      
      setTestStatus('success');
      hapticFeedback.success();
    } catch (error) {
      console.error('Error syncing:', error);
      setTestStatus('error');
      hapticFeedback.error();
      alert(`Failed to sync: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'save' | 'fetch' | 'sync') => {
    hapticFeedback.light();
    setActiveTab(tab);
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Offline Mode Test</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-amber-500" />
          )}
          <div>
            <div className="font-medium">{isOnline ? 'Connected' : 'Offline Mode'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isOfflineModeEnabled 
                ? 'Offline storage is enabled' 
                : 'Offline storage is disabled'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              hapticFeedback.medium();
              setOfflineModeEnabled(!isOfflineModeEnabled);
            }}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              isOfflineModeEnabled 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isOfflineModeEnabled ? 'Enabled' : 'Disabled'}
          </button>
          <button 
            onClick={simulateNetworkToggle}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 border-b overflow-hidden"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Testing Instructions:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Toggle offline mode to 'Enabled'</li>
                  <li>Use your browser's DevTools to simulate offline network</li>
                  <li>Try saving and retrieving data while offline</li>
                  <li>Return to online mode and sync your changes</li>
                </ol>
              </div>
            </div>
            <button 
              onClick={() => {
                hapticFeedback.light();
                setShowInstructions(false);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 mt-2 ml-8"
            >
              Hide Instructions
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Sync Notification */}
      {pendingSyncCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/30 p-4 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {pendingSyncCount} {pendingSyncCount === 1 ? 'item' : 'items'} pending sync
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400">
                These changes will sync when online
              </div>
            </div>
          </div>
          <button 
            onClick={testForceSync}
            disabled={!isOnline || loading}
            className="px-3 py-1 text-xs font-medium rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 disabled:opacity-50"
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => handleTabChange('save')}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeTab === 'save' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Save Data
        </button>
        <button
          onClick={() => handleTabChange('fetch')}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeTab === 'fetch' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Fetch Data
        </button>
        <button
          onClick={() => handleTabChange('sync')}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeTab === 'sync' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Sync Data
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'save' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Progress Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-gray-800"
                placeholder="Enter notes for your progress entry"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will create a new progress entry with your notes
              </p>
            </div>
            <button 
              onClick={testSaveProgress} 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-primary/50 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Progress Entry</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {activeTab === 'fetch' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <h3 className="text-sm font-medium mb-2">Fetch Progress Data</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                This will retrieve your progress entries from the last 30 days. 
                If offline, data will be fetched from local storage.
              </p>
              <button 
                onClick={testFetchData} 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="h-4 w-4" />
                    <span>Fetch Progress Entries</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'sync' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <h3 className="text-sm font-medium mb-2">Sync Offline Data</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                This will force a synchronization of all pending offline data with the server.
                {!isOnline && " You must be online to sync data."}
              </p>
              <button 
                onClick={testForceSync} 
                disabled={loading || !isOnline}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                  !isOnline 
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Force Sync Now</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Result */}
      {lastSavedItem && (
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Operation Result</h3>
            <button 
              onClick={() => {
                hapticFeedback.light();
                setLastSavedItem(null);
                setTestStatus('idle');
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          
          <div className={`p-3 rounded-md mb-2 flex items-center gap-2 ${
            testStatus === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : testStatus === 'error'
                ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
          }`}>
            {testStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
            {testStatus === 'error' && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            {testStatus === 'idle' && <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
            <span className="text-sm">
              {testStatus === 'success' ? 'Operation completed successfully' : 
               testStatus === 'error' ? 'Operation failed' : 
               'Waiting for operation'}
            </span>
          </div>
          
          <div className="mt-2 text-xs">
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto" style={{ maxHeight: '150px' }}>
              {JSON.stringify(lastSavedItem, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineTest; 