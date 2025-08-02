import React from "react";
import { FiDownload, FiRefreshCcw, FiFileText, FiPlus } from "react-icons/fi";
import CalendarView from "./CalendarView";
import type { Course } from "../types";

interface CalendarSectionProps {
  courses: Course[];
  previewCourse: Course | null;
  termDatesAvailable: boolean;
  onExportCurrentSchedule: () => void;
  onExportWithSwap: () => void;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  courses,
  previewCourse,
  termDatesAvailable,
  onExportCurrentSchedule,
  onExportWithSwap,
}) => {
  return (
    <div className="uwshuffle-calendar-section">
      <div className="uwshuffle-calendar-card">
        <div className="uwshuffle-calendar-header">
          <div className="uwshuffle-calendar-header-top">
            <div className="uwshuffle-calendar-title">Schedule</div>
            <div className="uwshuffle-calendar-actions">
              <button
                className="uwshuffle-export-button"
                disabled={courses.length === 0 || !termDatesAvailable}
                aria-disabled={courses.length === 0 || !termDatesAvailable}
                onClick={onExportCurrentSchedule}
                style={{
                  opacity:
                    courses.length === 0 || !termDatesAvailable ? 0.5 : 1,
                  cursor:
                    courses.length === 0 || !termDatesAvailable
                      ? "not-allowed"
                      : "pointer",
                }}
                title={
                  !termDatesAvailable
                    ? "Browse Quest course search results first to enable export"
                    : ""
                }
              >
                <FiDownload className="uwshuffle-icon-button" />
                Export Original
              </button>
              <button
                className="uwshuffle-export-button"
                disabled={
                  courses.length === 0 || !previewCourse || !termDatesAvailable
                }
                aria-disabled={
                  courses.length === 0 || !previewCourse || !termDatesAvailable
                }
                onClick={onExportWithSwap}
                style={{
                  opacity:
                    courses.length === 0 ||
                    !previewCourse ||
                    !termDatesAvailable
                      ? 0.5
                      : 1,
                  cursor:
                    courses.length === 0 ||
                    !previewCourse ||
                    !termDatesAvailable
                      ? "not-allowed"
                      : "pointer",
                }}
                title={
                  !termDatesAvailable
                    ? "Browse Quest course search results first to enable export"
                    : ""
                }
              >
                <FiRefreshCcw className="uwshuffle-icon-button" />
                Export w/ Swapped Class
              </button>
            </div>
          </div>
          <div className="uwshuffle-input-actions">
            <div className="uwshuffle-input-group">
              <div className="uwshuffle-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter text here..."
                  className="uwshuffle-input-field"
                />
                <button className="uwshuffle-plus-button">
                  <FiPlus className="uwshuffle-plus-icon" />
                </button>
              </div>
            </div>
            <label className="uwshuffle-checkbox-label">
              <input type="checkbox" className="uwshuffle-checkbox" />
              <span className="uwshuffle-checkbox-text">
                Preview Friend's Schedule
              </span>
            </label>
          </div>
        </div>

        <div className="uwshuffle-calendar-content">
          {courses.length === 0 ? (
            <div className="uwshuffle-calendar-empty">
              <FiFileText className="uwshuffle-calendar-empty-icon" />
              <div className="uwshuffle-calendar-empty-title">
                Nothing here yet
              </div>
              <div className="uwshuffle-calendar-empty-subtitle">
                Upload your schedule above to get started
              </div>
            </div>
          ) : (
            <CalendarView courses={courses} previewCourse={previewCourse} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;
