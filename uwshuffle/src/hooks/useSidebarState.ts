import { useState, useEffect } from 'react';

/**
 * Custom hook to manage sidebar minimized state with localStorage persistence
 */
export const useSidebarState = () => {
  // Load initial state from localStorage
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    const saved = localStorage.getItem('uwshuffle-sidebar-minimized');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        // Invalid localStorage data, using default
        localStorage.removeItem('uwshuffle-sidebar-minimized');
      }
    }
    return true; // Default to minimized
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('uwshuffle-sidebar-minimized', JSON.stringify(isMinimized));
  }, [isMinimized]);

  const handleCloseSidebar = () => {
    setIsMinimized(true);
    
    // Notify parent window about sidebar state change
    window.parent.postMessage(
      {
        type: 'uwshuffle_sidebar_state',
        isMinimized: true,
      },
      '*'
    );
  };

  const handleExpandSidebar = () => {
    setIsMinimized(false);
    
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