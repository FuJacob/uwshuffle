import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage Chrome storage operations with safety checks
 */
export const useChromeStorage = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isStorageAvailable = () => {
    return !!(window.chrome && chrome.storage && chrome.storage.local);
  };

  const getStorageItem = async <T>(key: string): Promise<T | null> => {
    if (!isStorageAvailable()) {
      return null;
    }

    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (isMountedRef.current) {
          resolve(result[key] || null);
        }
      });
    });
  };

  const setStorageItem = async (key: string, value: unknown): Promise<void> => {
    if (!isStorageAvailable()) {
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (isMountedRef.current) {
          resolve();
        }
      });
    });
  };

  const removeStorageItem = async (key: string): Promise<void> => {
    if (!isStorageAvailable()) {
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        if (isMountedRef.current) {
          resolve();
        }
      });
    });
  };

  return {
    isStorageAvailable,
    getStorageItem,
    setStorageItem,
    removeStorageItem,
    isMounted: () => isMountedRef.current,
  };
};