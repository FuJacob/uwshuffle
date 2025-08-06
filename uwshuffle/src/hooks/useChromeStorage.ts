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

  const isExtensionContextValid = () => {
    try {
      return !!(chrome && chrome.runtime && chrome.runtime.id);
    } catch (e) {
      console.warn("Extension context invalid:", e);
      return false;
    }
  };

  const isStorageAvailable = () => {
    return isExtensionContextValid() && !!(window.chrome && chrome.storage && chrome.storage.local);
  };

  const getStorageItem = async <T>(key: string): Promise<T | null> => {
    if (!isStorageAvailable()) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.warn("Chrome storage get error:", chrome.runtime.lastError);
            resolve(null);
            return;
          }
          if (isMountedRef.current) {
            resolve(result[key] || null);
          }
        });
      } catch (error) {
        console.warn("Extension context invalidated during storage get:", error);
        resolve(null);
      }
    });
  };

  const setStorageItem = async (key: string, value: unknown): Promise<void> => {
    if (!isStorageAvailable()) {
      return;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            console.warn("Chrome storage set error:", chrome.runtime.lastError);
            resolve();
            return;
          }
          if (isMountedRef.current) {
            resolve();
          }
        });
      } catch (error) {
        console.warn("Extension context invalidated during storage set:", error);
        resolve();
      }
    });
  };

  const removeStorageItem = async (key: string): Promise<void> => {
    if (!isStorageAvailable()) {
      return;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.remove([key], () => {
          if (chrome.runtime.lastError) {
            console.warn("Chrome storage remove error:", chrome.runtime.lastError);
            resolve();
            return;
          }
          if (isMountedRef.current) {
            resolve();
          }
        });
      } catch (error) {
        console.warn("Extension context invalidated during storage remove:", error);
        resolve();
      }
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