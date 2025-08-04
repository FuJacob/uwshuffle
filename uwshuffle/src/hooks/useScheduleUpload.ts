import { useState, useEffect } from 'react';
import type { Course } from '../types';
import { parseScheduleText } from '../utils/schedule';
import { useChromeStorage } from './useChromeStorage';

interface UseScheduleUploadProps {
  onCoursesUploaded: (courses: Course[]) => void;
  onClearSchedule: () => void;
  resetScraperState: () => void;
}

/**
 * Custom hook to manage schedule upload state and logic
 */
export const useScheduleUpload = ({
  onCoursesUploaded,
  onClearSchedule,
  resetScraperState,
}: UseScheduleUploadProps) => {
  const [scheduleText, setScheduleText] = useState('');
  const [isPasted, setIsPasted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearSuccess, setShowClearSuccess] = useState(false);
  const [showPasteError, setShowPasteError] = useState(false);
  
  const { getStorageItem, setStorageItem, removeStorageItem } = useChromeStorage();

  // Load courses from storage on mount
  useEffect(() => {
    const loadSavedCourses = async () => {
      const savedCourses = await getStorageItem<Course[]>('uwshuffle_courses');
      if (savedCourses && savedCourses.length > 0) {
        onCoursesUploaded(savedCourses);
        setIsPasted(true);
      }
    };

    loadSavedCourses();
  }, [getStorageItem, onCoursesUploaded]);

  const handleUpload = async (text?: string) => {
    const textToProcess = text || scheduleText;
    if (!textToProcess.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      const parsedCourses = parseScheduleText(textToProcess);
      if (parsedCourses.length === 0) {
        setShowPasteError(true);
        setTimeout(() => setShowPasteError(false), 3000);
        return;
      }

      onCoursesUploaded(parsedCourses);
      await setStorageItem('uwshuffle_courses', parsedCourses);
      setScheduleText('');
      setIsPasted(true);
    } catch (error) {
      console.error('Error parsing schedule:', error);
      setShowPasteError(true);
      setTimeout(() => setShowPasteError(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.trim()) {
      setScheduleText(pastedText);
      handleUpload(pastedText);
    }
  };

  const handleReset = async () => {
    setIsPasted(false);
    setScheduleText('');
    setIsProcessing(false);
    resetScraperState();
    onClearSchedule();
    setShowClearSuccess(true);
    await removeStorageItem('uwshuffle_courses');
    setTimeout(() => setShowClearSuccess(false), 3000);
  };

  return {
    scheduleText,
    isPasted,
    isProcessing,
    showClearSuccess,
    showPasteError,
    handleUpload,
    handlePaste,
    handleReset,
  };
};