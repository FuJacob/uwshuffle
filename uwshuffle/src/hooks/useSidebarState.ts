import { useState, useEffect } from 'react';
import { useChromeStorage } from './useChromeStorage';

/**
 * Custom hook to manage sidebar minimized state with Chrome storage persistence
 */
export const useSidebarState = () => {
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const { getStorageItem, setStorageItem, isMounted } = useChromeStorage();

  // Load initial state from Chrome storage
  useEffect(() => {
    const loadInitialState = async () => {
      const saved = await getStorageItem<boolean>('uw_shuffle_minimized');
      if (isMounted() && saved !== null) {
        setIsMinimized(saved);
      }
    };

    loadInitialState();
  }, [getStorageItem, isMounted]);

  const handleCloseSidebar = async () => {
    setIsMinimized(true);
    await setStorageItem('uw_shuffle_minimized', true);
    
    // Notify parent window about sidebar state change
    window.parent.postMessage(
      {
        type: 'uwshuffle_sidebar_state',
        isMinimized: true,
      },
      '*'
    );
  };

  const handleExpandSidebar = async () => {
    setIsMinimized(false);
    await setStorageItem('uw_shuffle_minimized', false);
    
    // Notify parent window about sidebar state change
    window.parent.postMessage(
      {
        type: 'uwshuffle_sidebar_state',
        isMinimized: false,
      },
      '*'
    );
  };

  return {
    isMinimized,
    handleCloseSidebar,
    handleExpandSidebar,
  };
};