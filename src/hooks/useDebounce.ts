import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * A custom hook that returns a debounced version of the provided function.
 * This is useful for delaying execution of a function, particularly for
 * performance-sensitive operations like search input handling.
 * 
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the provided function
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Return a memoized version of the debounced function
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );

  return debouncedFn;
};

/**
 * A hook that returns a debounced value.
 * Unlike useDebounce which debounces a function, this hook
 * debounces a value, updating it only after the specified delay.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export default useDebounce; 