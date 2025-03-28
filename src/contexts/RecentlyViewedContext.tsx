import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

// Define types
export interface ViewedItem {
  id: string;
  type: 'product' | 'article' | 'tool' | 'progress' | 'task';
  title: string;
  description?: string;
  imageUrl?: string;
  url: string;
  viewedAt: number;
}

interface RecentlyViewedContextType {
  recentItems: ViewedItem[];
  addItem: (item: Omit<ViewedItem, 'viewedAt'>) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  getItemsByType: (type: ViewedItem['type']) => ViewedItem[];
}

// Create context
const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null);

// Provider props
interface RecentlyViewedProviderProps {
  children: ReactNode;
  maxItems?: number;
}

/**
 * RecentlyViewedProvider component
 * Tracks and manages recently viewed items across the application
 */
export const RecentlyViewedProvider: React.FC<RecentlyViewedProviderProps> = ({ 
  children, 
  maxItems = 20 
}) => {
  const { user } = useAuth();
  const storageKey = user ? `recently_viewed_${user.id}` : 'recently_viewed_guest';
  
  // Use local storage to persist viewed items
  const [recentItems, setRecentItems] = useLocalStorage<ViewedItem[]>(storageKey, []);
  
  // Add a new item to recently viewed
  const addItem = (item: Omit<ViewedItem, 'viewedAt'>) => {
    setRecentItems(prevItems => {
      // Create new item with current timestamp
      const newItem: ViewedItem = {
        ...item,
        viewedAt: Date.now(),
      };
      
      // Remove duplicate if exists
      const filteredItems = prevItems.filter(existingItem => existingItem.id !== newItem.id);
      
      // Add new item at the beginning and limit the total number
      return [newItem, ...filteredItems].slice(0, maxItems);
    });
  };
  
  // Remove item from recently viewed
  const removeItem = (id: string) => {
    setRecentItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Clear all recently viewed items
  const clearHistory = () => {
    setRecentItems([]);
  };
  
  // Get items by type
  const getItemsByType = (type: ViewedItem['type']) => {
    return recentItems.filter(item => item.type === type);
  };
  
  // Reset history when user changes
  useEffect(() => {
    // This effect runs when the user changes
    // No need to do anything as the storageKey will change based on user
    // and the useLocalStorage hook will handle loading the correct data
  }, [user, storageKey]);
  
  // Create context value
  const contextValue: RecentlyViewedContextType = {
    recentItems,
    addItem,
    removeItem,
    clearHistory,
    getItemsByType,
  };
  
  return (
    <RecentlyViewedContext.Provider value={contextValue}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

/**
 * Hook to use the recently viewed context
 */
export const useRecentlyViewed = (): RecentlyViewedContextType => {
  const context = useContext(RecentlyViewedContext);
  
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  
  return context;
}; 