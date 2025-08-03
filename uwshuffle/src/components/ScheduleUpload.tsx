import React, { useState, useEffect } from "react";
import {
  FiCheck,
  FiHelpCircle,
  FiEye,
  FiBook,
  FiRefreshCcw,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";
import type { Course } from "../types";
import { Tooltip } from "react-tooltip";
import "./ScheduleUpload.css";

import UploadSuccessCard from "./UploadSuccessCard";
import ProcessingCard from "./ProcessingCard";
import PasteZone from "./PasteZone";
import CourseDropdown from "./CourseDropdown";
import { parseScheduleText } from "../utils/scheduleParser";

interface ScheduleUploadProps {
  setScheduleUploadError: (error: string | null) => void;
  onCoursesUploaded: (courses: Course[]) => void;
  onClearSchedule: () => void;
  courses: Course[];
  onCourseSelectedToSwap: (course: Course | null) => void;
  selectedCourseToSwap: Course | null;
}

const ScheduleUpload: React.FC<ScheduleUploadProps> = ({
  setScheduleUploadError,
  onCoursesUploaded,
  onClearSchedule,
  courses,
  onCourseSelectedToSwap,
  selectedCourseToSwap,
}) => {
  const [scheduleText, setScheduleText] = useState("");
  const [isPasted, setIsPasted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFindSuccess, setShowFindSuccess] = useState(false);
  const [showFindFailure, setShowFindFailure] = useState(false);
  const [showClearSuccess, setShowClearSuccess] = useState(false);
  const [hasScrapedSwaps, setHasScrapedSwaps] = useState(false);
  const [isActionCenterCollapsed, setIsActionCenterCollapsed] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  useEffect(() => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["uwshuffle_courses"], (result) => {
        if (result.uwshuffle_courses && result.uwshuffle_courses.length > 0) {
          onCoursesUploaded(result.uwshuffle_courses);
          setIsPasted(true); // Set isPasted to true when loading from storage
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  // Listen for scraper result messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "uwshuffle_scraper_result") {
        if (event.data.success === false) {
          setShowFindFailure(true);
          setTimeout(() => setShowFindFailure(false), 2000);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleUpload = (text?: string) => {
    const textToProcess = text || scheduleText;
    if (textToProcess.trim()) {
      setIsProcessing(true);
      try {
        const parsedCourses = parseScheduleText(textToProcess);
        if (parsedCourses.length === 0) {
          setScheduleUploadError("Invalid schedule format");
          return;
        }
        onCoursesUploaded(parsedCourses);
        if (window.chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ uwshuffle_courses: parsedCourses });
        }
        setScheduleText("");
        setIsPasted(true);
      } catch (error) {
        console.error("Error parsing schedule:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.trim()) {
      setScheduleText(pastedText);
      handleUpload(pastedText);
    }
  };

  const handleRefresh = () => {
    // Don't allow scraping if already scraped
    if (hasScrapedSwaps) {
      return;
    }
    
    // Start Quest scraper after schedule upload via postMessage to parent window
    try {
      window.parent.postMessage(
        {
          type: "uwshuffle_start_scraper",
          payload: { trigger: "schedule_upload" },
        },
        "*"
      );
      setShowFindSuccess(true);
      setHasScrapedSwaps(true); // Mark as scraped after successful trigger
      setTimeout(() => setShowFindSuccess(false), 2000);
    } catch (error) {
      console.error("UWShuffle: Error sending scraper start message:", error);
      setShowFindFailure(true);
      setTimeout(() => setShowFindFailure(false), 2000);
    }
  };

  const handleReset = () => {
    setIsPasted(false);
    setScheduleText("");
    setIsProcessing(false);
    setHasScrapedSwaps(false); // Reset scraped state when clearing schedule
    onClearSchedule();
    setShowClearSuccess(true);
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(["uwshuffle_courses"]);
    }
    setTimeout(() => setShowClearSuccess(false), 2000);
  };

  const handleCourseSelect = (course: Course) => {
    onCourseSelectedToSwap(course);
    setShowCourseDropdown(false);
  };

  return (
    <div className="schedule-upload-container">
      {/* Control Panel Title */}
      <div className="schedule-upload-title-container">
        <div className="schedule-upload-title">
          Action Center
          <FiHelpCircle
            className="uwshuffle-help-icon"
            data-tooltip-id="action-center-tooltip"
            data-tooltip-content="Upload your schedule, find swap options, and clear your schedule. The central hub for all schedule management actions."
          />
        </div>
        <button
          onClick={() => setIsActionCenterCollapsed(!isActionCenterCollapsed)}
          className="uwshuffle-collapse-button"
        >
          {isActionCenterCollapsed ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>
      <Tooltip
        id="action-center-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="find-swap-disabled-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="clear-schedule-disabled-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="select-course-disabled-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      {!isActionCenterCollapsed && (
        <>
          {/* Large Paste Card */}
          <label className="uwshuffle-input-label">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              {courses.length === 0 ? (
                <FiBook
                  style={{ color: "var(--color-primary)", opacity: 0.7 }}
                />
              ) : (
                <FiCheckCircle style={{ color: "var(--color-primary)" }} />
              )}
              <span
                style={{
                  color:
                    !courses || courses.length === 0
                      ? "var(--color-text-primary)"
                      : "var(--color-text-tertiary)",
                }}
              >
                1/3: To start, paste your current schedule below
              </span>
            </div>
          </label>
          {isPasted ? (
            <UploadSuccessCard
              courses={courses}
              onReset={handleReset}
              showClearSuccess={showClearSuccess}
            />
          ) : isProcessing ? (
            <ProcessingCard />
          ) : (
            <PasteZone onPaste={handlePaste} isActive={courses.length === 0} />
          )}

          <label className="uwshuffle-input-label">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              {selectedCourseToSwap ? (
                <FiCheckCircle style={{ color: "var(--color-primary)" }} />
              ) : (
                <FiBook
                  style={{ color: "var(--color-primary)", opacity: 0.7 }}
                />
              )}
              <span
                style={{
                  color:
                    !selectedCourseToSwap && courses.length !== 0
                      ? "var(--color-text-primary)"
                      : "var(--color-text-tertiary)",
                }}
              >
                2/3: Then select the existing course you're looking to swap
              </span>
            </div>
          </label>
          <CourseDropdown
            courses={courses}
            selectedCourse={selectedCourseToSwap}
            onCourseSelect={handleCourseSelect}
            showDropdown={showCourseDropdown}
            onToggleDropdown={() => setShowCourseDropdown(!showCourseDropdown)}
            disabled={courses.length === 0}
            tooltipId="select-course-disabled-tooltip"
            tooltipContent="Upload your schedule first to select a course to swap"
            isActive={courses.length !== 0 && !selectedCourseToSwap}
          />
          <label className="uwshuffle-input-label">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              {courses.length === 0 ? (
                <FiRefreshCcw
                  style={{ color: "var(--color-primary)", opacity: 0.7 }}
                />
              ) : (
                <FiCheckCircle style={{ color: "var(--color-primary)" }} />
              )}
              <span
                style={{
                  color:
                    selectedCourseToSwap && courses.length !== 0
                      ? "var(--color-text-primary)"
                      : "var(--color-text-tertiary)",
                }}
              >
                3/3: Click Scrape Swaps to get your swap options!
              </span>
            </div>
          </label>
          <div className="schedule-upload-button-container">
            <button
              onClick={handleRefresh}
              className={`schedule-upload-primary ${
                courses.length !== 0 && selectedCourseToSwap ? "active" : ""
              } ${showFindFailure ? "schedule-upload-primary-failure" : ""}`}
              disabled={courses.length === 0 || !selectedCourseToSwap || hasScrapedSwaps}
              aria-disabled={courses.length === 0 || !selectedCourseToSwap || hasScrapedSwaps}
              style={{
                opacity:
                  courses.length === 0 || !selectedCourseToSwap || hasScrapedSwaps ? 0.5 : 1,
                cursor:
                  courses.length === 0 || !selectedCourseToSwap || hasScrapedSwaps
                    ? "not-allowed"
                    : "pointer",
              }}
              data-tooltip-id={
                courses.length === 0 || !selectedCourseToSwap || hasScrapedSwaps
                  ? "find-swap-disabled-tooltip"
                  : undefined
              }
              data-tooltip-content={
                courses.length === 0
                  ? "Please upload your schedule first to find swap options"
                  : !selectedCourseToSwap
                  ? "Please select a course to swap first"
                  : hasScrapedSwaps
                  ? "Already scraped - clear your schedule to scrape again"
                  : undefined
              }
            >
              {showFindFailure ? (
                <FiX className="schedule-upload-icon-button" />
              ) : showFindSuccess ? (
                <FiCheck className="schedule-upload-icon-button" />
              ) : (
                <FiEye className="schedule-upload-icon-button" />
              )}
              Scrape Swaps
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleUpload;
