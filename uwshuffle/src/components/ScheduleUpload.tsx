import React, { useState } from "react";
import {
  FiCheck,
  FiHelpCircle,
  FiEye,
  FiBook,
  FiUser,
  FiRefreshCcw,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiLoader,
} from "react-icons/fi";
import { Tooltip } from "react-tooltip";

// Components
import CourseDropdown from "./CourseDropdown";
import PasteZone from "./PasteZone";
import ProcessingCard from "./ProcessingCard";
import UploadSuccessCard from "./UploadSuccessCard";

// Hooks
import { useScheduleUpload } from "../hooks/useScheduleUpload";
import { useScraperState } from "../hooks/useScraperState";

// Types
import type { Course } from "../types";

interface ScheduleUploadProps {
  onCoursesUploaded: (courses: Course[]) => void;
  onClearSchedule: () => void;
  courses: Course[];
  onCourseSelectedToSwap: (course: Course | null | "None") => void;
  selectedCourseToSwap: Course | null | "None";
}

const ScheduleUpload: React.FC<ScheduleUploadProps> = ({
  onCoursesUploaded,
  onClearSchedule,
  courses,
  onCourseSelectedToSwap,
  selectedCourseToSwap,
}) => {
  // UI state
  const [isActionCenterCollapsed, setIsActionCenterCollapsed] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  // Custom hooks
  const {
    showFindSuccess,
    showFindFailure,
    isScrapingLoading,
    hasScrapedSwaps,
    handleRefresh,
    resetScraperState,
  } = useScraperState();

  const {
    isPasted,
    isProcessing,
    showClearSuccess,
    showPasteError,
    handlePaste,
    handleReset,
  } = useScheduleUpload({
    onCoursesUploaded,
    onClearSchedule,
    resetScraperState,
  });



  const handleCourseSelect = (course: Course | "None") => {
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
            data-tooltip-content="Upload your schedule, find swap options, and clear your schedule. This is your main workspace for managing your courses."
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
            <PasteZone onPaste={handlePaste} isActive={courses.length === 0} isError={showPasteError} />
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
                <FiUser
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
            tooltipContent="Upload your schedule first to select which course you want to swap"
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
                3/3: Click Scrape Available Swaps to get your class options!
              </span>
            </div>
          </label>
          <div className="schedule-upload-button-container">
            <button
              onClick={handleRefresh}
              className={`schedule-upload-primary ${
                courses.length !== 0 && selectedCourseToSwap ? "active" : ""
              } ${
                showFindFailure 
                  ? "schedule-upload-primary-failure" 
                  : showFindSuccess 
                  ? "schedule-upload-primary-success" 
                  : ""
              }`}
              disabled={
                courses.length === 0 || !selectedCourseToSwap || (hasScrapedSwaps && !showFindFailure) || isScrapingLoading
              }
              aria-disabled={
                courses.length === 0 || !selectedCourseToSwap || (hasScrapedSwaps && !showFindFailure) || isScrapingLoading
              }
              style={{
                opacity:
                  courses.length === 0 ||
                  !selectedCourseToSwap ||
                  (hasScrapedSwaps && !showFindFailure) ||
                  isScrapingLoading
                    ? 0.5
                    : 1,
                cursor:
                  courses.length === 0 ||
                  !selectedCourseToSwap ||
                  (hasScrapedSwaps && !showFindFailure) ||
                  isScrapingLoading
                    ? "not-allowed"
                    : "pointer",
              }}
              data-tooltip-id={
                courses.length === 0 || !selectedCourseToSwap || (hasScrapedSwaps && !showFindFailure) || isScrapingLoading
                  ? "find-swap-disabled-tooltip"
                  : undefined
              }
              data-tooltip-content={
                courses.length === 0
                  ? "Upload your schedule first to find swap options from Quest"
                  : !selectedCourseToSwap
                  ? "Select a course to swap first"
                  : isScrapingLoading
                  ? "Scraping in progress..."
                  : (hasScrapedSwaps && !showFindFailure)
                  ? "Already found swap options - clear your schedule to search again"
                  : undefined
              }
            >
              {showFindFailure ? (
                <FiX className="schedule-upload-icon-button" />
              ) : showFindSuccess ? (
                <FiCheck className="schedule-upload-icon-button" />
              ) : isScrapingLoading ? (
                <FiLoader className="schedule-upload-icon-button uwshuffle-spin" />
              ) : (
                <FiEye className="schedule-upload-icon-button" />
              )}
              {showFindFailure
                ? "Failed - Try Again"
                : showFindSuccess
                ? "Found Swap Options!"
                : isScrapingLoading
                ? "Scraping..."
                : "Scrape Available Swaps"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleUpload;
