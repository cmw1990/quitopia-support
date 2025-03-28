# Mission Fresh Offline Mode

The Mission Fresh app includes robust offline capabilities that allow users to continue logging their progress, tracking cravings, and managing tasks even when they don't have an internet connection.

## User Guide

### How to Enable Offline Mode

1. Navigate to **Settings** → **App Settings** tab
2. Toggle the "Enable Offline Mode" switch to ON
3. You will see the offline indicator appear in the bottom-right corner of the app

### Using the Offline Indicator

The offline indicator provides a visual representation of your connection status:

- **Green dot**: You're online
- **Yellow dot**: You're offline

You can click the indicator to expand it and see more options:

- **Enable/Disable Offline Mode**: Toggle offline mode on or off
- **Sync Now**: Manually sync pending changes when online
- **Pending Changes**: View how many changes are waiting to be synced

### What Gets Stored Offline

When offline mode is enabled, the following data is stored locally:

- Progress entries
- Consumption logs
- Craving logs
- Tasks

All changes made while offline are automatically synced when you reconnect to the internet.

### Testing Offline Mode

You can test the offline functionality using our built-in test utility:

1. Navigate to **Settings** → **App Settings** → **Test Offline Mode**
2. Use the test page to:
   - Save test data
   - Fetch data while offline
   - Force manual sync

## Developer Guide

### Architecture Overview

The offline functionality is built using the following components:

1. **IndexedDB Storage**: Used for local data persistence
2. **Sync Queue**: Tracks operations performed offline for later synchronization
3. **Context Provider**: Provides offline state management throughout the app
4. **API Client Integration**: Makes the API client offline-aware

### Key Components

#### OfflineStorageService

This service manages all interactions with the local IndexedDB database. It provides methods for:

- Storing and retrieving data
- Managing the sync queue
- Syncing data with the server when online

```typescript
// Example: Saving progress while offline
const savedData = await offlineStorageService.saveProgress({
  user_id: userId,
  date: new Date().toISOString().split('T')[0],
  smoke_free: true,
  notes: "Added while offline"
});
```

#### OfflineContext

A React context that provides offline status and methods throughout the application:

```typescript
// Using the offline context in a component
const { isOnline, isOfflineModeEnabled, syncPendingChanges } = useOffline();

// Check if offline mode is available
if (!isOnline && isOfflineModeEnabled) {
  // Work offline
}
```

#### MissionFreshApiClient

The API client is configured to automatically handle offline scenarios:

- Data is saved locally first, then to the server when online
- If offline, operations are saved to the sync queue
- When back online, the sync queue is processed

```typescript
// Example: API client handles offline mode automatically
const result = await missionFreshApiClient.saveUserProgress(userId, progressData);
// If offline, this will still "succeed" by saving to local storage
```

### Testing Offline Mode During Development

1. **Browser DevTools**: Use Chrome's Network tab to simulate offline mode
2. **Test Utility**: Use the built-in test utility at `/app/offline-test`
3. **IndexedDB Explorer**: Examine stored data using browser DevTools → Application → IndexedDB

### Adding Offline Support to New Data Types

To extend offline support to new types of data:

1. Add a new interface to the `MissionFreshOfflineDB` interface in `OfflineStorageService.ts`
2. Create a new object store in the `initDB` method
3. Add methods for retrieving and saving the new data type
4. Update the API client to use these methods

## Troubleshooting

### Data Not Syncing

If data isn't syncing when coming back online:

1. Check if offline mode is enabled
2. Verify you have an internet connection 
3. Try manually triggering a sync from the offline indicator
4. Check browser console for any errors

### Lost Data

If you believe you've lost data:

1. Check the IndexedDB storage in your browser's DevTools
2. Verify that offline mode was enabled when you were offline
3. Look for errors in the console related to the sync process

### Performance Issues

If you experience performance issues with offline mode:

1. Check how much data is stored locally
2. Clear unnecessary offline data through the Settings
3. Ensure you're not storing very large amounts of data locally

## Future Enhancements

We plan to enhance offline mode with the following features:

1. Conflict resolution for data edited both offline and online
2. Selective syncing of specific data types
3. Better visualization of pending sync operations
4. Improved performance for large datasets

## Contributing to Offline Mode

If you're a developer looking to enhance the offline functionality:

1. See the code in `src/services/OfflineStorageService.ts`
2. Check `src/contexts/OfflineContext.tsx` for the React integration
3. Test your changes using the test utility at `/app/offline-test` 