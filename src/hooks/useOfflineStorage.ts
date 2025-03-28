import { useState, useEffect } from 'react';
import { offlineStorage } from '../services/OfflineStorageService';

// Hook for using offline storage
export function useOfflineStorage<T>(key: string, initialValue: T): [
  T,
  (value: T) => Promise<void>,
  { isLoading: boolean; error: Error | null }
] {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load data from offline storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const storedData = await offlineStorage.getItem<T>(key);
        if (storedData !== null) {
          setData(storedData);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error loading data'));
        console.error(`Error loading data for key ${key}:`, err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [key]);

  // Save data to offline storage
  const saveData = async (newData: T): Promise<void> => {
    try {
      setIsLoading(true);
      await offlineStorage.setItem(key, newData);
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error saving data'));
      console.error(`Error saving data for key ${key}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return [data, saveData, { isLoading, error }];
}

export default useOfflineStorage; 