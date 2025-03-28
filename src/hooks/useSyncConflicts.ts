import { useState, useCallback } from 'react';
import { SyncConflict } from '../components/SyncConflictResolver';
import offlineStorageService from '../services/BackwardCompatibility';
import { useOffline } from '../contexts/OfflineContext';
import { toast } from 'sonner';

/**
 * Hook for managing sync conflicts between online and offline data
 */
export const useSyncConflicts = () => {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const { syncData } = useOffline();

  /**
   * Detect conflicts between local and remote data
   * @param localItems Local data items
   * @param remoteItems Remote data items
   * @param entityType Type of entity (e.g., 'task', 'journal', etc.)
   * @param idField Field name to use as the ID
   * @param modifiedField Field name to use for the modified timestamp
   */
  const detectConflicts = useCallback(
    (
      localItems: any[],
      remoteItems: any[],
      entityType: string,
      idField: string = 'id',
      modifiedField: string = 'updated_at'
    ) => {
      const newConflicts: SyncConflict[] = [];
      const remoteMap = new Map(remoteItems.map(item => [item[idField], item]));
      
      // Find items that exist in both local and remote
      for (const localItem of localItems) {
        // Skip items that don't have an ID (newly created locally)
        if (!localItem[idField] || localItem[idField].startsWith('temp_')) continue;
        
        const remoteItem = remoteMap.get(localItem[idField]);
        if (!remoteItem) continue; // Item only exists locally
        
        // Compare timestamps to detect conflicts
        const localModified = new Date(localItem[modifiedField] || localItem.created_at).getTime();
        const remoteModified = new Date(remoteItem[modifiedField] || remoteItem.created_at).getTime();
        
        // If both were modified, we have a potential conflict
        // Only consider it a conflict if data is actually different
        if (localModified > 0 && remoteModified > 0 && 
            JSON.stringify(localItem) !== JSON.stringify(remoteItem)) {
          
          newConflicts.push({
            id: localItem[idField],
            localData: localItem,
            remoteData: remoteItem,
            entityType,
            timestamp: {
              local: localItem[modifiedField] || localItem.created_at,
              remote: remoteItem[modifiedField] || remoteItem.created_at
            }
          });
        }
      }
      
      setConflicts(prev => [...prev, ...newConflicts]);
      
      if (newConflicts.length > 0) {
        setShowConflictDialog(true);
      }
      
      return newConflicts.length > 0;
    },
    []
  );

  /**
   * Resolve a conflict
   */
  const resolveConflict = useCallback(
    async (conflict: SyncConflict, resolution: 'local' | 'remote' | 'merge') => {
      try {
        const { id, localData, remoteData, entityType } = conflict;
        
        let resolvedData;
        
        switch (resolution) {
          case 'local':
            resolvedData = { ...localData };
            break;
          case 'remote':
            resolvedData = { ...remoteData };
            break;
          case 'merge':
            // Simple merge strategy - prefer remote data but keep unique local fields
            resolvedData = {
              ...localData,
              ...remoteData,
              // Keep special fields from local version if they exist
              ...(localData.tags && { tags: localData.tags }),
              ...(localData.notes && { notes: localData.notes }),
              updated_at: new Date().toISOString()
            };
            break;
        }

        // Set updated timestamp
        resolvedData.updated_at = new Date().toISOString();
        resolvedData.synced = false;
        
        // Save to appropriate storage based on entity type
        if (entityType === 'task') {
          await offlineStorageService.saveTask(resolvedData);
        } else if (entityType === 'journal') {
          await offlineStorageService.setItem(`journal_${id}`, resolvedData);
        } else if (entityType === 'progress') {
          await offlineStorageService.saveProgress(resolvedData);
        } else if (entityType === 'consumption') {
          await offlineStorageService.saveConsumptionLog(resolvedData);
        } else if (entityType === 'craving') {
          await offlineStorageService.saveCraving(resolvedData);
        } else {
          await offlineStorageService.setItem(`${entityType}_${id}`, resolvedData);
        }
        
        // Update conflicts list
        setConflicts(prev => 
          prev.map(c => 
            c.id === conflict.id 
              ? { ...c, resolved: true, resolution } 
              : c
          )
        );
        
        return resolvedData;
      } catch (error) {
        console.error('Error resolving conflict:', error);
        toast.error('Failed to resolve conflict');
        throw error;
      }
    },
    []
  );

  /**
   * Handle when all conflicts are resolved
   */
  const handleAllResolved = useCallback(async () => {
    setShowConflictDialog(false);
    
    // Attempt to sync data again
    setIsResolving(true);
    try {
      await syncData();
      toast.success('All conflicts resolved and data synchronized');
    } catch (error) {
      console.error('Error syncing after conflict resolution:', error);
    } finally {
      setIsResolving(false);
    }
  }, [syncData]);
  
  /**
   * Reset all conflicts (for testing purposes)
   */
  const resetConflicts = useCallback(() => {
    setConflicts([]);
    setShowConflictDialog(false);
  }, []);

  return {
    conflicts,
    showConflictDialog,
    setShowConflictDialog,
    detectConflicts,
    resolveConflict,
    handleAllResolved,
    resetConflicts,
    isResolving
  };
};

export default useSyncConflicts; 