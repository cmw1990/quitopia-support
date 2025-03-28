import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  WifiOff, 
  Database, 
  ArrowRight, 
  RefreshCw, 
  Settings, 
  Code, 
  CheckCircle,
  AlertTriangle,
  Book,
  FileText,
  Github
} from 'lucide-react';
import { useOffline } from '../contexts/OfflineContext';

const OfflineDocs: React.FC = () => {
  const { isOfflineModeEnabled, setOfflineModeEnabled } = useOffline();

  const features = [
    {
      title: 'Offline Storage',
      description: 'Local storage for user data when offline using IndexedDB',
      icon: Database,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      title: 'Auto-Sync',
      description: 'Automatically sync data when connection is restored',
      icon: RefreshCw,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    },
    {
      title: 'Conflict Resolution',
      description: 'Smart handling of conflicts between local and server data',
      icon: CheckCircle,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    },
    {
      title: 'Network Detection',
      description: 'Real-time detection of network status changes',
      icon: WifiOff,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
    }
  ];

  const documentationSections = [
    {
      title: 'Getting Started',
      description: 'Learn how to enable and use offline mode',
      link: '#getting-started',
      icon: Book
    },
    {
      title: 'API Reference',
      description: 'Technical documentation for developers',
      link: '#api-reference',
      icon: Code
    },
    {
      title: 'Implementation Details',
      description: 'How offline mode works under the hood',
      link: '#implementation',
      icon: FileText
    },
    {
      title: 'Source Code',
      description: 'View the implementation source code',
      link: '#source-code',
      icon: Github
    }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 rounded-full bg-primary/10 dark:bg-primary/20">
            <WifiOff className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mission Fresh Offline Mode</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-lg">
              Continue your quit journey even without an internet connection
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/app/offline-test"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Test Offline Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/app/settings"
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Offline Settings
                <Settings className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-b border-t bg-white dark:bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isOfflineModeEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="font-medium">Offline Mode: {isOfflineModeEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        <button
          onClick={() => setOfflineModeEnabled(!isOfflineModeEnabled)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            isOfflineModeEnabled 
              ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isOfflineModeEnabled ? 'Disable' : 'Enable'} Offline Mode
        </button>
      </div>

      {/* Features Grid */}
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Technical Documentation */}
      <div className="p-6 border-t">
        <h2 className="text-xl font-bold mb-4">Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentationSections.map((section, index) => (
            <motion.a
              key={section.title}
              href={section.link}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 border rounded-lg p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{section.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Usage Section */}
      <div className="p-6 border-t">
        <h2 className="text-xl font-bold mb-4" id="getting-started">Getting Started</h2>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-400">Important Usage Notes</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Offline mode is designed for temporary use when internet connection is unavailable. Some features may 
                have limited functionality while offline. All data will be synced once connection is restored.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Using in Components</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Access offline functionality in your components using the useOffline hook:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
              <code>{`import { useOffline } from '../contexts/OfflineContext';

const YourComponent = () => {
  const { 
    isOnline, 
    isOfflineModeEnabled, 
    setOfflineModeEnabled,
    syncPendingChanges,
    pendingSyncCount
  } = useOffline();
  
  // Your component logic here
}`}</code>
            </pre>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">API Client Integration</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              The API client automatically handles offline requests when offline mode is enabled:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
              <code>{`// This will work both online and offline
const result = await missionFreshApiClient.saveUserProgress(
  userId, 
  progressData
);`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="p-6 border-t" id="api-reference">
        <h2 className="text-xl font-bold mb-4">API Reference</h2>
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">OfflineContext</h3>
            <table className="w-full text-sm mt-2">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="py-2 px-3 text-left">Property/Method</th>
                  <th className="py-2 px-3 text-left">Type</th>
                  <th className="py-2 px-3 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">isOnline</td>
                  <td className="py-2 px-3">boolean</td>
                  <td className="py-2 px-3">Current network connection status</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">isOfflineModeEnabled</td>
                  <td className="py-2 px-3">boolean</td>
                  <td className="py-2 px-3">Whether offline data storage is enabled</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">setOfflineModeEnabled</td>
                  <td className="py-2 px-3">function</td>
                  <td className="py-2 px-3">Enable/disable offline mode</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">syncPendingChanges</td>
                  <td className="py-2 px-3">async function</td>
                  <td className="py-2 px-3">Force sync of offline data</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">pendingSyncCount</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Count of pending offline items</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Implementation Section */}
      <div className="p-6 border-t" id="implementation">
        <h2 className="text-xl font-bold mb-4">Implementation Details</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          The offline functionality is built using several key components:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>IndexedDB Storage:</strong> Using the idb library to provide a persistent local database
          </li>
          <li>
            <strong>Request Queue:</strong> Failed API requests are stored in a queue for later synchronization
          </li>
          <li>
            <strong>Network Detection:</strong> Utilizing the Navigator.onLine API with event listeners
          </li>
          <li>
            <strong>Conflict Resolution:</strong> Timestamp-based resolution for handling conflicting changes
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t">
        Mission Fresh Offline Mode Documentation
      </div>
    </div>
  );
};

export default OfflineDocs; 