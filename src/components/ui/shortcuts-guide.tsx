import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { keyboardShortcuts } from '../../lib/keyboard-shortcuts';
import { Command, Keyboard } from 'lucide-react';
import { userPreferences } from '../../lib/user-preferences';

interface ShortcutCategoryProps {
  title: string;
  shortcuts: { description: string; binding: string }[];
}

const ShortcutCategory: React.FC<ShortcutCategoryProps> = ({ title, shortcuts }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">{title}</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <motion.div
            key={shortcut.binding}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.binding.split('+').map((key, i) => (
                <React.Fragment key={i}>
                  <kbd className="px-2 py-1 text-sm font-semibold bg-gray-100 dark:bg-gray-700 rounded shadow">
                    {key}
                  </kbd>
                  {i < shortcut.binding.split('+').length - 1 && (
                    <span className="text-gray-400">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface ShortcutsGuideProps {
  onClose?: () => void;
}

export const ShortcutsGuide: React.FC<ShortcutsGuideProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const shortcuts = keyboardShortcuts.getShortcutHelp();
  const isEnabled = keyboardShortcuts.isEnabled();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsVisible(prev => !prev);
      } else if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, onClose]);

  const toggleKeyboardShortcuts = () => {
    const newState = !isEnabled;
    keyboardShortcuts.setEnabled(newState);
    if (!newState) {
      setIsVisible(false);
      onClose?.();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-24 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Show Keyboard Shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsVisible(false);
                onClose?.();
              }
            }}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Command className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Enable Shortcuts</span>
                      <motion.button
                        onClick={toggleKeyboardShortcuts}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <motion.span
                          initial={false}
                          animate={{ x: isEnabled ? 20 : 2 }}
                          className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
                        />
                      </motion.button>
                    </label>
                    <button
                      onClick={() => {
                        setIsVisible(false);
                        onClose?.();
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Press <kbd className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded">Ctrl</kbd> + 
                  <kbd className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded ml-1">?</kbd> 
                  to show/hide this guide
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {Object.entries(shortcuts)
                  .filter(([_, shortcuts]) => shortcuts.length > 0)
                  .slice(0, showAll ? undefined : 3)
                  .map(([category, shortcuts]) => (
                    <ShortcutCategory
                      key={category}
                      title={category.charAt(0).toUpperCase() + category.slice(1)}
                      shortcuts={shortcuts}
                    />
                  ))}

                {Object.keys(shortcuts).length > 3 && (
                  <motion.button
                    onClick={() => setShowAll(!showAll)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mt-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showAll ? 'Show Less' : 'Show All Categories'}
                  </motion.button>
                )}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tip: These shortcuts are designed to be ADHD-friendly and can be customized in settings
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
