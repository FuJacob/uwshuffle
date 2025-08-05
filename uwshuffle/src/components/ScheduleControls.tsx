import React, { useState } from "react";
import {
  FiDownload,
  FiRefreshCcw,
  FiLink,
  FiHelpCircle,
  FiCheck,
  FiSend,
  FiUserPlus,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiLoader,
} from "react-icons/fi";
import type { Course, FriendSchedule } from "../types";
import { readQuickLink, generateQuickLink } from "../utils/external";
import { getColorFromName } from "../utils/schedule";
import { Tooltip } from "react-tooltip";

interface ScheduleControlsProps {
  courses: Course[];
  previewCourse: Course | null;
  termDatesAvailable: boolean;
  onExportCurrentSchedule: () => { success: boolean; error?: string };
  onExportWithSwap: () => { success: boolean; error?: string };
  onFriendSchedulesChange: (friendSchedules: FriendSchedule[]) => void;
  friendSchedules: FriendSchedule[];
}

const ScheduleControls: React.FC<ScheduleControlsProps> = ({
  courses,
  previewCourse,
  termDatesAvailable,
  onExportCurrentSchedule,
  onExportWithSwap,
  onFriendSchedulesChange,
  friendSchedules,
}) => {
  const [addFriendLink, setAddFriendLink] = useState<string>("");
  const [isScheduleControlsCollapsed, setIsScheduleControlsCollapsed] =
    useState<boolean>(false);
  const [showShareSuccess, setShowShareSuccess] = useState<boolean>(false);
  const [showNameInput, setShowNameInput] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [showAddFriendError, setShowAddFriendError] = useState<boolean>(false);
  const [showShareError, setShowShareError] = useState<boolean>(false);
  const [showNameError, setShowNameError] = useState<boolean>(false);

  // Export button states
  const [exportCurrentLoading, setExportCurrentLoading] =
    useState<boolean>(false);
  const [exportCurrentSuccess, setExportCurrentSuccess] =
    useState<boolean>(false);
  const [exportCurrentError, setExportCurrentError] = useState<boolean>(false);
  const [exportSwapLoading, setExportSwapLoading] = useState<boolean>(false);
  const [exportSwapSuccess, setExportSwapSuccess] = useState<boolean>(false);
  const [exportSwapError, setExportSwapError] = useState<boolean>(false);

  const handleExportCurrent = async () => {
    setExportCurrentLoading(true);
    setExportCurrentError(false);
    setExportCurrentSuccess(false);

    try {
      const result = onExportCurrentSchedule();
      if (result.success) {
        setExportCurrentSuccess(true);
        setTimeout(() => setExportCurrentSuccess(false), 3000);
      } else {
        setExportCurrentError(true);
        setTimeout(() => setExportCurrentError(false), 3000);
      }
    } catch {
      setExportCurrentError(true);
      setTimeout(() => setExportCurrentError(false), 3000);
    } finally {
      setExportCurrentLoading(false);
    }
  };

  const handleExportWithSwap = async () => {
    setExportSwapLoading(true);
    setExportSwapError(false);
    setExportSwapSuccess(false);

    try {
      const result = onExportWithSwap();
      if (result.success) {
        setExportSwapSuccess(true);
        setTimeout(() => setExportSwapSuccess(false), 3000);
      } else {
        setExportSwapError(true);
        setTimeout(() => setExportSwapError(false), 3000);
      }
    } catch {
      setExportSwapError(true);
      setTimeout(() => setExportSwapError(false), 3000);
    } finally {
      setExportSwapLoading(false);
    }
  };

  const handleAddFriendSchedule = async (quickLink: string) => {
    if (!quickLink.trim()) {
      return;
    }

    try {
      const result = await readQuickLink(quickLink);
      if (result && result.courses) {
        const friendName =
          result.userName || `Friend ${friendSchedules.length + 1}`;
        const newFriendSchedule = {
          name: friendName,
          visible: true,
          color: getColorFromName(friendName),
          schedule: result.courses,
        };
        onFriendSchedulesChange([...friendSchedules, newFriendSchedule]);
        setAddFriendLink("");
      } else {
        console.error(
          "Failed to load friend schedule - invalid link or schedule not found"
        );
        setShowAddFriendError(true);
        setAddFriendLink("");
        setTimeout(() => setShowAddFriendError(false), 3000);
      }
    } catch (error) {
      console.error("Error adding friend schedule:", error);
      setShowAddFriendError(true);
      setAddFriendLink("");
      setTimeout(() => setShowAddFriendError(false), 3000);
    }
  };

  const handleShareSchedule = async () => {
    if (courses.length === 0) {
      setShowShareError(true);
      setTimeout(() => setShowShareError(false), 3000);
      return;
    }
    // Show inline input to get user's name first
    setShowNameInput(true);
  };

  const handleConfirmShare = async () => {
    if (!userName.trim()) {
      setShowNameError(true);
      setTimeout(() => setShowNameError(false), 3000);
      return;
    }

    const schedule = courses.map((course) => ({
      ...course,
    }));
    const quickLink = await generateQuickLink(schedule, userName.trim());

    // Use execCommand for Chrome extension compatibility
    try {
      // Create a temporary textarea element
      const textArea = document.createElement("textarea");
      textArea.value = quickLink;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      // Execute copy command
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (!successful) {
        throw new Error("execCommand failed");
      }
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      // If all else fails, show the link in a prompt
      prompt("Copy this link to share your schedule:", quickLink);
      setShowNameInput(false);
      return;
    }

    // Hide input and show success state
    setShowNameInput(false);
    setUserName("");
    setShowShareSuccess(true);
    setTimeout(() => {
      setShowShareSuccess(false);
    }, 3000);
  };

  return (
    <>
      <div className="uwshuffle-schedule-controls-card">
        <div className="uwshuffle-schedule-controls-header">
          <div className="uwshuffle-schedule-controls-title">
            Schedule Controls
            <FiHelpCircle
              className="uwshuffle-help-icon"
              data-tooltip-id="schedule-controls-tooltip"
              data-tooltip-content="Share your schedule with friends using quick links and export to Google Calendar with or without your swap preview."
            />
          </div>
          <button
            onClick={() =>
              setIsScheduleControlsCollapsed(!isScheduleControlsCollapsed)
            }
            className="uwshuffle-collapse-button"
          >
            {isScheduleControlsCollapsed ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
        {!isScheduleControlsCollapsed && (
          <div className="uwshuffle-schedule-controls-content">
            <div className="uwshuffle-input-actions">
              <label className="uwshuffle-input-label">
                Want to see your friend's schedule on top of yours?
              </label>
              <div className="uwshuffle-input-group">
                <div className="uwshuffle-input-wrapper">
                  <input
                    type="text"
                    placeholder="Paste their quick link here..."
                    className={`uwshuffle-input-field ${
                      showAddFriendError ? "uwshuffle-input-field-error" : ""
                    }`}
                    value={addFriendLink}
                    onChange={(e) => {
                      setAddFriendLink(e.target.value);
                    }}
                  />
                  <button
                    onClick={() => handleAddFriendSchedule(addFriendLink)}
                    className={`uwshuffle-plus-button ${
                      showAddFriendError ? "uwshuffle-plus-button-error" : ""
                    }`}
                  >
                    {showAddFriendError ? (
                      <FiX className="uwshuffle-plus-icon" />
                    ) : (
                      <FiUserPlus className="uwshuffle-plus-icon" />
                    )}
                  </button>
                </div>
                <button
                  className={`uwshuffle-share-button ${
                    showShareSuccess
                      ? "uwshuffle-share-button-success"
                      : showShareError
                      ? "uwshuffle-share-button-error"
                      : ""
                  }`}
                  disabled={courses.length === 0 && !showShareError}
                  aria-disabled={courses.length === 0 && !showShareError}
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
                      ? "Upload your schedule first to generate a shareable link"
                      : "Generate a quick link to share your schedule with friends"
                  }
                >
                  {showShareSuccess ? (
                    <>
                      <FiCheck className="uwshuffle-share-icon" />
                      Copied to clipboard
                    </>
                  ) : showShareError ? (
                    <>
                      <FiX className="uwshuffle-share-icon" />
                      Upload schedule first
                    </>
                  ) : (
                    <>
                      <FiLink className="uwshuffle-share-icon" />
                      Share my calendar
                    </>
                  )}
                </button>
              </div>
              {showNameInput && (
                <div className="uwshuffle-name-input-container">
                  <div className="uwshuffle-input-wrapper">
                    <input
                      type="text"
                      placeholder="Enter your name..."
                      className={`uwshuffle-input-field ${
                        showNameError ? "uwshuffle-input-field-error" : ""
                      }`}
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleConfirmShare();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleConfirmShare}
                      className={`uwshuffle-send-button ${
                        showNameError ? "uwshuffle-send-button-error" : ""
                      }`}
                      disabled={!userName.trim() && !showNameError}
                    >
                      {showNameError ? (
                        <FiX className="uwshuffle-send-icon" />
                      ) : (
                        <FiSend className="uwshuffle-send-icon" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="uwshuffle-export-actions">
              <label className="uwshuffle-input-label">
                Want to export your calendar to Google Calendar?
              </label>
              <div className="uwshuffle-export-buttons">
                <button
                  className={`uwshuffle-export-button ${
                    exportCurrentSuccess
                      ? "uwshuffle-export-button-success"
                      : exportCurrentError
                      ? "uwshuffle-export-button-error"
                      : ""
                  }`}
                  disabled={
                    courses.length === 0 ||
                    !termDatesAvailable ||
                    exportCurrentLoading
                  }
                  aria-disabled={
                    courses.length === 0 ||
                    !termDatesAvailable ||
                    exportCurrentLoading
                  }
                  onClick={handleExportCurrent}
                  style={{
                    opacity:
                      courses.length === 0 ||
                      !termDatesAvailable ||
                      exportCurrentLoading
                        ? 0.5
                        : 1,
                    cursor:
                      courses.length === 0 ||
                      !termDatesAvailable ||
                      exportCurrentLoading
                        ? "not-allowed"
                        : "pointer",
                  }}
                  data-tooltip-id={
                    courses.length === 0 ||
                    !termDatesAvailable ||
                    exportCurrentLoading
                      ? "export-schedule-disabled-tooltip"
                      : undefined
                  }
                  data-tooltip-content={
                    courses.length === 0
                      ? "Upload your schedule first to export it"
                      : !termDatesAvailable
                      ? "Browse Quest course search results first to enable export"
                      : exportCurrentLoading
                      ? "Exporting schedule..."
                      : undefined
                  }
                >
                  {exportCurrentError ? (
                    <FiX className="uwshuffle-icon-button" />
                  ) : exportCurrentSuccess ? (
                    <FiCheck className="uwshuffle-icon-button" />
                  ) : exportCurrentLoading ? (
                    <FiLoader className="uwshuffle-icon-button uwshuffle-spin" />
                  ) : (
                    <FiDownload className="uwshuffle-icon-button" />
                  )}
                  {exportCurrentError
                    ? "Export Failed"
                    : exportCurrentSuccess
                    ? "Exported!"
                    : exportCurrentLoading
                    ? "Exporting..."
                    : "Export Schedule (.ics)"}
                </button>
                <button
                  className={`uwshuffle-export-button ${
                    exportSwapSuccess
                      ? "uwshuffle-export-button-success"
                      : exportSwapError
                      ? "uwshuffle-export-button-error"
                      : ""
                  }`}
                  disabled={
                    courses.length === 0 ||
                    !previewCourse ||
                    !termDatesAvailable ||
                    exportSwapLoading
                  }
                  aria-disabled={
                    courses.length === 0 ||
                    !previewCourse ||
                    !termDatesAvailable ||
                    exportSwapLoading
                  }
                  onClick={handleExportWithSwap}
                  style={{
                    opacity:
                      courses.length === 0 ||
                      !previewCourse ||
                      !termDatesAvailable ||
                      exportSwapLoading
                        ? 0.5
                        : 1,
                    cursor:
                      courses.length === 0 ||
                      !previewCourse ||
                      !termDatesAvailable ||
                      exportSwapLoading
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
                      : exportSwapLoading
                      ? "Exporting schedule with swap..."
                      : undefined
                  }
                >
                  {exportSwapError ? (
                    <FiX className="uwshuffle-icon-button" />
                  ) : exportSwapSuccess ? (
                    <FiCheck className="uwshuffle-icon-button" />
                  ) : exportSwapLoading ? (
                    <FiLoader className="uwshuffle-icon-button uwshuffle-spin" />
                  ) : (
                    <FiRefreshCcw className="uwshuffle-icon-button" />
                  )}
                  {exportSwapError
                    ? "Export Failed"
                    : exportSwapSuccess
                    ? "Exported!"
                    : exportSwapLoading
                    ? "Exporting..."
                    : "Export w/ Swap"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Tooltip
        id="schedule-controls-tooltip"
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
    </>
  );
};

export default ScheduleControls;
