import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { capturedLogs, clearCapturedLogs } from '../utils/consoleLogger';

interface ConsoleErrorDisplayProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showOnlyErrors?: boolean;
}

export default function ConsoleErrorDisplay({
  position = 'bottom-right',
  showOnlyErrors = true
}: ConsoleErrorDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState(capturedLogs);

  useEffect(() => {
    // Update logs every 2 seconds
    const interval = setInterval(() => {
      setLogs([...capturedLogs]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Filter logs if showOnlyErrors is true
  const filteredLogs = showOnlyErrors 
    ? logs.filter(log => log.type === 'error') 
    : logs;

  // Determine position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (filteredLogs.length === 0) {
    return null;
  }

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50`}
    >
      {!isOpen ? (
        <button 
          className="bg-red-500 text-white px-3 py-2 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          {filteredLogs.length} {filteredLogs.length === 1 ? 'Error' : 'Errors'}
        </button>
      ) : (
        <div className="bg-white rounded-md shadow-xl border border-gray-200 w-96 max-h-96 overflow-auto">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">Console {showOnlyErrors ? 'Errors' : 'Logs'}</h3>
            <div className="flex space-x-2">
              <button 
                className="text-xs bg-gray-100 px-2 py-1 rounded" 
                onClick={() => {
                  clearCapturedLogs();
                  setLogs([]);
                }}
              >
                Clear
              </button>
              <button 
                className="text-gray-400 hover:text-gray-600" 
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="p-3">
            {filteredLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No errors to display</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredLogs.map((log, index) => (
                  <li key={index} className="py-2">
                    <div className={`text-xs font-mono ${log.type === 'error' ? 'text-red-600' : log.type === 'warn' ? 'text-amber-600' : 'text-gray-700'}`}>
                      <div className="flex justify-between">
                        <span className="font-semibold">{log.type.toUpperCase()}</span>
                        <span className="text-gray-400">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="mt-1 whitespace-pre-wrap break-words">
                        {log.args.map(arg => 
                          typeof arg === 'object' 
                            ? JSON.stringify(arg, null, 2) 
                            : String(arg)
                        ).join(' ')}
                      </pre>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 