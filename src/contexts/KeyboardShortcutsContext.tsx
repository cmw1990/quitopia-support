import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { keyboardShortcuts } from '../lib/keyboard-shortcuts';
import { userPreferences } from '../lib/user-preferences';
import { focusEventBus } from '../lib/focus-event-bus';

interface KeyboardShortcutsContextType {
  isEnabled: boolean;
  toggleEnabled: () => void;
  showGuide: boolean;
  setShowGuide: (show: boolean) => void;
  recentShortcut: string | null;
  shortcuts: Record<string, { description: string; binding: string }[]>;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const [isEnabled, setIsEnabled] = useState(() => 
    userPreferences.getPreferences().assistance.useKeyboardShortcuts
  );
  const [showGuide, setShowGuide] = useState(false);
  const [recentShortcut, setRecentShortcut] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState(keyboardShortcuts.getShortcutHelp());

  useEffect(() => {
    const handleShortcut = (event: { data: { shortcut: string } }) => {
      setRecentShortcut(event.data.shortcut);
      // Clear recent shortcut after 2 seconds
      setTimeout(() => setRecentShortcut(null), 2000);
    };

    const unsubscribeShortcut = focusEventBus.subscribe('shortcutTriggered', handleShortcut);

    // Listen for preference changes
    const unsubscribePrefs = userPreferences.subscribe(prefs => {
      setIsEnabled(prefs.assistance.useKeyboardShortcuts);
    });

    // Setup global shortcut for guide toggle
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowGuide(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      unsubscribeShortcut();
      unsubscribePrefs();
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const toggleEnabled = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    userPreferences.updatePreferences({
      assistance: {
        ...userPreferences.getPreferences().assistance,
        useKeyboardShortcuts: newState
      }
    });
    keyboardShortcuts.setEnabled(newState);

    focusEventBus.emit('accessibilityChange', {
      feature: 'keyboardShortcuts',
      enabled: newState,
      value: newState
    });
  };

  // Effect to refresh shortcuts when they change
  useEffect(() => {
    const interval = setInterval(() => {
      const currentShortcuts = keyboardShortcuts.getShortcutHelp();
      setShortcuts(currentShortcuts);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    isEnabled,
    toggleEnabled,
    showGuide,
    setShowGuide,
    recentShortcut,
    shortcuts
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {recentShortcut && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/75 text-white rounded-lg text-sm z-50"
          >
            Shortcut: {recentShortcut}
          </motion.div>
        )}
      </AnimatePresence>
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
}
