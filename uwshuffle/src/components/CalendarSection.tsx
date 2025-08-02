import { useState } from "react";
import { pastelColors } from "../constants/courseColors";

function getColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % pastelColors.length;
  return pastelColors[idx];
}
import {
  FiDownload,
  FiRefreshCcw,
  FiPlus,
  FiLink,
  FiMinus,
  FiHelpCircle,
  FiCheck,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import CalendarView from "./CalendarView";
import type { Course } from "../types";
import { readQuickLink } from "../utils/readQuickLink";
import type { FriendSchedule } from "../types";
import { generateQuickLink } from "../utils/generateQuickLink";
import { Tooltip } from "react-tooltip";
interface CalendarSectionProps {
  courses: Course[];
  previewCourse: Course | null;
  termDatesAvailable: boolean;
  onExportCurrentSchedule: () => void;
  onExportWithSwap: () => void;
  selectedCourseToSwap?: Course | null;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  courses,
  previewCourse,
  termDatesAvailable,
  onExportCurrentSchedule,
  onExportWithSwap,
  selectedCourseToSwap,
}) => {
  const [friendSchedules, setFriendSchedules] = useState<FriendSchedule[]>([]);
  const [addFriendLink, setAddFriendLink] = useState<string>("");
  const [isScheduleControlsCollapsed, setIsScheduleControlsCollapsed] =
    useState<boolean>(false);
  const [isCalendarCollapsed, setIsCalendarCollapsed] =
    useState<boolean>(false);
  const [showShareSuccess, setShowShareSuccess] = useState<boolean>(false);
  const handleAddFriendSchedule = async (quickLink: string) => {
    if (!quickLink.trim()) {
      return;
    }

    try {
      const friendCourses = await readQuickLink(quickLink);
      if (friendCourses) {
        console.log("Successfully loaded friend schedule:", friendCourses);
        const friendName = `Friend ${friendSchedules.length + 1}`;
        setFriendSchedules([
          ...friendSchedules,
          {
            name: friendName,
            visible: true,
            color: getColorFromName(friendName),
            schedule: friendCourses,
          },
        ]);
        setAddFriendLink("");
      } else {
        console.error(
          "Failed to load friend schedule - invalid link or schedule not found"
        );
        alert("Failed to load schedule. Please check the link and try again.");
      }
    } catch (error) {
      console.error("Error adding friend schedule:", error);
      alert("An error occurred while loading the schedule. Please try again.");
    }
  };

  const handleShareSchedule = async () => {
    if (courses.length === 0) {
      alert("No courses to share. Please upload your schedule first.");
      return;
    }
    const schedule = courses.map((course) => ({
      ...course,
    }));
    const quickLink = await generateQuickLink(schedule);
    navigator.clipboard.writeText(quickLink);

    // Show success state
    setShowShareSuccess(true);
    setTimeout(() => {
      setShowShareSuccess(false);
    }, 2000);
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
            <FiHelpCircle
              className="uwshuffle-help-icon"
              data-tooltip-id="schedule-controls-tooltip"
              data-tooltip-content="Share your schedule with friends and export your calendar to Google Calendar with or without your swap preview."
            />
          </div>
          <button
            onClick={() =>
              setIsScheduleControlsCollapsed(!isScheduleControlsCollapsed)
            }
            className="uwshuffle-collapse-button"
          >
            {isScheduleControlsCollapsed ? <FiPlus /> : <FiMinus />}
          </button>
        </div>
        {!isScheduleControlsCollapsed && (
          <div className="uwshuffle-schedule-controls-content">
            <div className="uwshuffle-input-actions">
              <label className="uwshuffle-input-label">
                Want to see your friend's schedule?
              </label>
              <div className="uwshuffle-input-group">
                <div className="uwshuffle-input-wrapper">
                  <input
                    type="text"
                    placeholder="Paste their quick link here..."
                    className="uwshuffle-input-field"
                    value={addFriendLink}
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
                <button
                  className="uwshuffle-share-button"
                  disabled={courses.length === 0}
                  aria-disabled={courses.length === 0}
                  onClick={handleShareSchedule}
                  style={{
                    opacity: courses.length === 0 ? 0.5 : 1,
                    cursor: courses.length === 0 ? "not-allowed" : "pointer",
                  }}
                  data-tooltip-id={
                    courses.length === 0 ? "share-disabled-tooltip" : undefined
                  }
                  data-tooltip-content={
                    courses.length === 0
                      ? "Upload your schedule first to share it with friends"
                      : "Share your schedule with others"
                  }
                >
                  {showShareSuccess ? (
                    <FiCheck className="uwshuffle-share-icon" />
                  ) : (
                    <FiLink className="uwshuffle-share-icon" />
                  )}
                  Share mine
                </button>
              </div>
            </div>
            <div className="uwshuffle-export-actions">
              <label className="uwshuffle-input-label">
                Want to export your calendar to Google Calendar?
              </label>
              <div className="uwshuffle-export-buttons">
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
                  data-tooltip-id={
                    courses.length === 0 || !termDatesAvailable
                      ? "export-schedule-disabled-tooltip"
                      : undefined
                  }
                  data-tooltip-content={
                    courses.length === 0
                      ? "Upload your schedule first to export it"
                      : !termDatesAvailable
                      ? "Browse Quest course search results first to enable export"
                      : undefined
                  }
                >
                  <FiDownload className="uwshuffle-icon-button" />
                  Export Schedule
                </button>
                <button
                  className="uwshuffle-export-button"
                  disabled={
                    courses.length === 0 ||
                    !previewCourse ||
                    !termDatesAvailable
                  }
                  aria-disabled={
                    courses.length === 0 ||
                    !previewCourse ||
                    !termDatesAvailable
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
                  data-tooltip-id={
                    courses.length === 0 ||
                    !previewCourse ||
                    !termDatesAvailable
                      ? "export-swap-disabled-tooltip"
                      : undefined
                  }
                  data-tooltip-content={
                    courses.length === 0
                      ? "Upload your schedule first to export with swap"
                      : !previewCourse
                      ? "Select a course to preview before exporting with swap"
                      : !termDatesAvailable
                      ? "Browse Quest course search results first to enable export"
                      : undefined
                  }
                >
                  <FiRefreshCcw className="uwshuffle-icon-button" />
                  Export w/ Swap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Card */}
      <div className="uwshuffle-calendar-card">
        <div className="uwshuffle-calendar-header">
          <div className="uwshuffle-calendar-header-top">
            <div className="uwshuffle-calendar-title">
              Schedule
              <FiHelpCircle
                className="uwshuffle-help-icon"
                data-tooltip-id="schedule-tooltip"
                data-tooltip-content="View your weekly schedule with all courses. Preview courses appear with a different color to show potential conflicts."
              />
              {friendSchedules.map((friendSchedule) => (
                <button
                  className={`uwshuffle-tag-button ${
                    !friendSchedule.visible ? "uwshuffle-tag-button-hidden" : ""
                  }`}
                  style={{
                    backgroundColor: friendSchedule.color,
                  }}
                  key={friendSchedule.name}
                  onClick={() =>
                    handleToggleFriendSchedule(friendSchedule.name)
                  }
                >
                  {friendSchedule.visible ? (
                    <FiEye className="uwshuffle-tag-icon" />
                  ) : (
                    <FiEyeOff className="uwshuffle-tag-icon" />
                  )}
                  {friendSchedule.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
              className="uwshuffle-collapse-button"
            >
              {isCalendarCollapsed ? <FiPlus /> : <FiMinus />}
            </button>
          </div>
        </div>
        {!isCalendarCollapsed && (
          <div className="uwshuffle-calendar-content">
            <CalendarView
              courses={courses}
              previewCourse={previewCourse}
              friendSchedules={friendSchedules}
              selectedCourseToSwap={selectedCourseToSwap}
            />
          </div>
        )}
      </div>
      <Tooltip
        id="schedule-controls-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="schedule-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="share-disabled-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="export-schedule-disabled-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="export-swap-disabled-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
    </div>
  );
};

export default CalendarSection;
