import { useState, useEffect } from 'react';

/**
 * Custom hook to manage scraper state and messaging
 */
export const useScraperState = () => {
  const [showFindSuccess, setShowFindSuccess] = useState(false);
  const [showFindFailure, setShowFindFailure] = useState(false);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [hasScrapedSwaps, setHasScrapedSwaps] = useState(false);

  // Listen for scraper result messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'uwshuffle_scraper_result') {
        setIsScrapingLoading(false);
        if (event.data.success === true) {
          setShowFindSuccess(true);
          setTimeout(() => setShowFindSuccess(false), 3000);
        } else if (event.data.success === false) {
          setShowFindFailure(true);
          setTimeout(() => setShowFindFailure(false), 3000);
          // Reset scraped state on failure so user can try again
          setHasScrapedSwaps(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Check if preview buttons still exist on the page to reset scrape state
  useEffect(() => {
    const checkPreviewButtons = () => {
      const previewButtons = document.querySelectorAll('.uwshuffle-add-btn');
      if (hasScrapedSwaps && previewButtons.length === 0) {
        setHasScrapedSwaps(false);
      }
    };

    checkPreviewButtons();
    const intervalId = setInterval(checkPreviewButtons, 2000);
    return () => clearInterval(intervalId);
  }, [hasScrapedSwaps]);

  const handleRefresh = () => {
    // Don't allow scraping if already scraped or loading
    if (hasScrapedSwaps || isScrapingLoading) {
      return;
    }

    try {
      setIsScrapingLoading(true);
      window.parent.postMessage(
        {
          type: 'uwshuffle_start_scraper',
          payload: { trigger: 'schedule_upload' },
        },
        '*'
      );
      setHasScrapedSwaps(true);
    } catch (error) {
      console.error('UWShuffle: Error sending scraper start message:', error);
      setIsScrapingLoading(false);
      setShowFindFailure(true);
      setTimeout(() => setShowFindFailure(false), 3000);
    }
  };

  const resetScraperState = () => {
    setHasScrapedSwaps(false);
    setIsScrapingLoading(false);
    setShowFindSuccess(false);
    setShowFindFailure(false);
  };

  return {
    showFindSuccess,
    showFindFailure,
    isScrapingLoading,
    hasScrapedSwaps,
    handleRefresh,
    resetScraperState,
  };
};