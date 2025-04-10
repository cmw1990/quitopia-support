import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface EditHistoryItem {
  timestamp: string;
  description: string;
  type: 'frontend' | 'backend';
}

export function DevelopmentModeIndicator() {
  const [isVisible, setIsVisible] = useState(true);
  const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([]);
  const location = useLocation();

  useEffect(() => {
    // Load persisted state
    const persistedState = localStorage.getItem('devModeIndicatorState');
    if (persistedState) {
      setIsVisible(JSON.parse(persistedState).isVisible);
    }
  }, []);

  useEffect(() => {
    // Save state to localStorage
    localStorage.setItem('devModeIndicatorState', JSON.stringify({ isVisible }));
  }, [isVisible]);

  useEffect(() => {
    // Add route change to edit history
    const newHistoryItem: EditHistoryItem = {
      timestamp: new Date().toISOString(),
      description: `Navigated to ${location.pathname}`,
      type: 'frontend'
    };
    setEditHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
  }, [location]);

  if (!isVisible || process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-primary-600 dark:text-primary-400">🍎</span>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Close development mode indicator"
              title="Close development mode indicator"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <p className="font-semibold text-gray-900 dark:text-white">
              If you see this apple, it means we are in good shape! 🚀
            </p>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Branch: surf1</p>
              <p>Mode: Development</p>
              <p>Last Edit: {new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Edit History */}
          <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
            {editHistory.map((item, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                <p className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
