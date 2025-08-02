import React, { useState } from "react";
import {
  FiDownload,
  FiRefreshCcw,
  FiFileText,
  FiPlus,
  FiLink,
} from "react-icons/fi";
import CalendarView from "./CalendarView";
import type { Course } from "../types";
import { readQuickLink } from "../utils/readQuickLink";
import type { FriendSchedule } from "../types";
import { generateQuickLink } from "../utils/generateQuickLink";
interface CalendarSectionProps {
  courses: Course[];
  previewCourse: Course | null;
  termDatesAvailable: boolean;
  onExportCurrentSchedule: () => void;
  onExportWithSwap: () => void;
}

function hashStringToHue(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}
function getColorFromName(name: string) {
  const hue = hashStringToHue(name);
  return `hsl(${hue}, 78%, 54%)`;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  courses,
  previewCourse,
  termDatesAvailable,
  onExportCurrentSchedule,
  onExportWithSwap,
}) => {
  const [friendSchedules, setFriendSchedules] = useState<FriendSchedule[]>([]);
  const [addFriendLink, setAddFriendLink] = useState<string>("");
  const handleAddFriendSchedule = (schedule: string) => {
    const friendSchedule = await readQuickLink(schedule);
    if (friendSchedule) {
      setFriendSchedules([
        ...friendSchedules,
        {
          name: "BOB",
          visible: true,
          color: getColorFromName(friendSchedule.name),
          schedule: friendSchedule,
        },
      ]);
    }
    setAddFriendLink("");
  };

  const handleShareSchedule = () => {
    if (courses.length === 0) {
      alert("No courses to share. Please upload your schedule first.");
      return;
    }
    const schedule = courses.map((course) => ({
      ...course,
    }));
    const quickLink = generateQuickLink(schedule);
    navigator.clipboard.writeText(quickLink);
  };

  const handleToggleFriendSchedule = (name: string) => {
    setFriendSchedules((prev) =>
      prev.map((f) => (f.name === name ? { ...f, visible: !f.visible } : f))
    );
  };

  return (
    <div className="uwshuffle-calendar-section">
      {/* Schedule Controls Card */}
      <div className="uwshuffle-schedule-controls-card">
        <div className="uwshuffle-schedule-controls-header">
          <div className="uwshuffle-schedule-controls-title">
            Schedule Controls
          </div>
        </div>
        <div className="uwshuffle-schedule-controls-content">
          <div className="uwshuffle-input-actions">
            <div className="uwshuffle-input-group">
              <label className="uwshuffle-input-label">
                Want to see your friend's schedule?
              </label>
              <div className="uwshuffle-input-wrapper">
                <input
                  type="text"
                  placeholder="Paste their quick link here..."
                  className="uwshuffle-input-field"
                  onChange={(e) => {
                    setAddFriendLink(e.target.value);
                  }}
                />
                <button
                  onClick={() => handleAddFriendSchedule(addFriendLink)}
                  className="uwshuffle-plus-button"
                >
                  <FiPlus className="uwshuffle-plus-icon" />
                </button>
              </div>
            </div>
          </div>
          <div className="uwshuffle-export-actions">
            <button
              className="uwshuffle-export-button"
              disabled={courses.length === 0}
              aria-disabled={courses.length === 0}
              onClick={handleShareSchedule}
              style={{
                opacity: courses.length === 0 ? 0.5 : 1,
                cursor: courses.length === 0 ? "not-allowed" : "pointer",
              }}
              title="Share your schedule with others"
            >
              <FiLink className="uwshuffle-icon-button" />
              Share My Schedule
            </button>
            <button
              className="uwshuffle-export-button"
              disabled={courses.length === 0 || !termDatesAvailable}
              aria-disabled={courses.length === 0 || !termDatesAvailable}
              onClick={onExportCurrentSchedule}
              style={{
                opacity: courses.length === 0 || !termDatesAvailable ? 0.5 : 1,
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
              Export Schedule
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
                  courses.length === 0 || !previewCourse || !termDatesAvailable
                    ? 0.5
                    : 1,
                cursor:
                  courses.length === 0 || !previewCourse || !termDatesAvailable
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
              Export w/ Swap
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Card */}
      <div className="uwshuffle-calendar-card">
        <div className="uwshuffle-calendar-header">
          <div className="uwshuffle-calendar-title">
            Schedule
            {friendSchedules.map((friendSchedule) => (
              <button
                className={`uwshuffle-tag-button ${
                  !friendSchedule.visible ? "uwshuffle-tag-button-hidden" : ""
                }`}
                key={friendSchedule.name}
                onClick={() => handleToggleFriendSchedule(friendSchedule.name)}
              >
                {friendSchedule.name}
              </button>
            ))}
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
            <CalendarView
              courses={courses}
              previewCourse={previewCourse}
              friendSchedules={friendSchedules}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;
