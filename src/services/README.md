# Mission Fresh Offline Mode

This directory contains services that enable offline functionality in the Mission Fresh application.

## Overview

The offline mode feature allows users to continue using the application even when they have no internet connection. Data is stored locally using IndexedDB and synced with the server when the connection is restored.

## Key Components

### 1. OfflineStorageService.ts

A service that manages local data storage using IndexedDB. It provides methods for:

- Storing and retrieving user progress, consumption logs, craving entries, and tasks
- Tracking pending sync operations
- Syncing data with the server when online
- Managing offline mode settings

### 2. OfflineContext.tsx

A React context that provides offline functionality to all components in the application. It:

- Tracks online/offline status
- Manages offline mode settings
- Provides methods for syncing data
- Counts pending sync operations

### 3. useOfflineStorage.ts

A hook that wraps the OfflineContext for backward compatibility with existing components.

### 4. OfflineIndicator.tsx

A UI component that displays:

- Current online/offline status
- A toggle for enabling/disabling offline mode
- Pending sync count
- Button for manual syncing

## Usage

### In Components

```tsx
import { useOffline } from '../contexts/OfflineContext';

const MyComponent = () => {
  const { 
    isOnline, 
    isOfflineModeEnabled, 
    setOfflineModeEnabled,
    syncPendingChanges
  } = useOffline();

  // Use these values in your component
  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <button onClick={() => setOfflineModeEnabled(!isOfflineModeEnabled)}>
        Toggle Offline Mode
      </button>
    </div>
  );
};
```

### In API Calls

Our API client automatically handles offline functionality:

- Data is saved locally first for safety
- If offline, operations are queued for later sync
- When online, data is sent to the server and local storage is updated

## Implementation Details

The offline implementation uses:

- IndexedDB for local data storage (via the `idb` library)
- A sync queue to track pending operations
- Event listeners for network status changes
- Axios for API requests

## Extending Offline Support

To add offline support to new data types:

1. Add a new interface to the `MissionFreshOfflineDB` interface in `OfflineStorageService.ts`
2. Create a new object store in the `initDB` method
3. Add methods for retrieving and saving the new data type
4. Update the API client to use these methods

## Testing Offline Mode

To test offline mode:

1. Enable offline mode in the application
2. Disconnect from the internet (use browser DevTools Network tab)
3. Perform operations that require network access
4. Reconnect to the internet and verify data is synced 