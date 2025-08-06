// ONBOARDING TOUR DISABLED - All functionality commented out
// import { useState, useEffect } from 'react';
// import type { CallBackProps } from 'react-joyride';
// import { useChromeStorage } from './useChromeStorage';

/**
 * Custom hook to manage the onboarding tour state and logic - DISABLED
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useOnboardingTour = (_isMinimized: boolean) => {
  // All onboarding functionality disabled
  // const [run, setRun] = useState(false);
  // const { getStorageItem, setStorageItem, isMounted } = useChromeStorage();

  // // Check onboarding completion status on mount
  // useEffect(() => {
  //   const checkOnboardingStatus = async () => {
  //     const completed = await getStorageItem<boolean>('uwshuffle_onboarding_completed');
  //     if (isMounted()) {
  //       setRun(completed !== true);
  //     }
  //   };

  //   checkOnboardingStatus();
  // }, [getStorageItem, isMounted]);

  // // Start tour when sidebar is first expanded, stop when minimized
  // useEffect(() => {
  //   if (!isMinimized) {
  //     const startTourIfNeeded = async () => {
  //       const completed = await getStorageItem<boolean>('uwshuffle_onboarding_completed');
  //       if (isMounted() && completed !== true) {
  //         setRun(true);
  //       }
  //     };

  //     // Start tour after a short delay to ensure components are rendered
  //     const timeoutId = setTimeout(startTourIfNeeded, 100);
  //     return () => clearTimeout(timeoutId);
  //   } else {
  //     // Stop tour when sidebar is minimized to prevent target mounting issues
  //     setRun(false);
  //   }
  // }, [isMinimized, getStorageItem, isMounted]);

  // const handleJoyrideCallback = async (data: CallBackProps) => {
  //   const { status, action } = data;
  //   if (status === 'finished' || action === 'skip') {
  //     setRun(false);
  //     await setStorageItem('uwshuffle_onboarding_completed', true);
  //   }
  // };

  // const startTour = () => {
  //   setRun(true);
  // };

  // Return dummy values since tour is disabled
  return {
    run: false,
    handleJoyrideCallback: () => {},
    startTour: () => {},
  };
};