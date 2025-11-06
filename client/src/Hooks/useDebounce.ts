'use client';

import { useState, useCallback } from 'react';
import { debounce as debounceFn } from '@/Functions';

/**
 * Custom hook for debounced value
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
) => {
  const debouncedCallback = useCallback(
    debounceFn(callback, delay),
    [callback, delay]
  );

  return debouncedCallback;
};

/**
 * Custom hook for debounced input value
 */
export const useDebouncedValue = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const updateValue = useDebounce((newValue: T) => {
    setDebouncedValue(newValue);
  }, delay);

  useState(() => {
    updateValue(value);
  });

  return debouncedValue;
};

export default useDebounce;
