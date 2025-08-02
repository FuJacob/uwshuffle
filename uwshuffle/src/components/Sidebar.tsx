import React, { useState, useEffect } from "react";
import {
  FiClipboard,
  FiBook,
  FiBarChart2,
  FiHeart,
  FiX,
  FiArrowRight,
  FiStar,
  FiChevronUp,
} from "react-icons/fi";
import CalendarView from "./CalendarView";
import ScheduleUpload from "./ScheduleUpload";
import type { Course } from "../types";
import logo from "../assets/logo.svg";
import instructionsVideo from "../assets/instructions.mp4";

const Sidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isInstructionsCollapsed, setIsInstructionsCollapsed] =
    useState<boolean>(false);
  const [currentInstructionStep, setCurrentInstructionStep] =
    useState<number>(0);

  const instructions = [
    'Click "Swap" and enter your target course',
    'Click "Show All" and copy schedule',
    "Paste text into UWShuffle",
  ];

  const handleNextInstruction = () => {
    setCurrentInstructionStep((prev) => (prev + 1) % instructions.length);
  };

  // Listen for messages from content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "uwshuffle_action") {
        switch (event.data.action) {
          case "add_preview_course":
            setPreviewCourse(event.data.data);
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleCoursesUploaded = (newCourses: Course[]) => {
    setCourses(newCourses);
  };

  const handleClearSchedule = () => {
    setCourses([]);
  };

  const handleKofiClick = () => {
    // Open Ko-fi page
    window.open("https://ko-fi.com/jacobfu", "_blank", "noopener,noreferrer");
  };

  const handleCloseSidebar = () => {
    setIsMinimized(true);
    // Notify parent window about sidebar state change
    window.parent.postMessage(
      {
        type: "uwshuffle_sidebar_state",
        isMinimized: true,
      },
      "*"
    );
  };

  const handleExpandSidebar = () => {
    setIsMinimized(false);
    // Notify parent window about sidebar state change
    window.parent.postMessage(
      {
        type: "uwshuffle_sidebar_state",
        isMinimized: false,
      },
      "*"
    );
  };

  const handleToggleInstructions = () => {
    setIsInstructionsCollapsed(!isInstructionsCollapsed);
  };

  // addPreviewCourse is handled via message listener

  return (
    <>
      <div
        className={`uwshuffle-sidebar ${
          isMinimized ? "uwshuffle-sidebar-minimized" : ""
        }`}
      >
        {!isMinimized && (
          <>
            {/* Main Content Area */}
            <div className="uwshuffle-main-content">
              {/* Top Action Bar */}
              <div className="uwshuffle-action-bar">
                <div className="uwshuffle-action-bar-logo">
                  <img src={logo} alt="UWShuffle" />
                  <span className="uwshuffle-action-bar-title">UWShuffle</span>
                </div>
                <div className="uwshuffle-action-bar-author">
                  <FiStar className="uwshuffle-icon" />
                  Rate
                </div>
                <div className="uwshuffle-action-bar-buttons">
                  {/* Ko-fi Button */}
                  <button
                    onClick={handleKofiClick}
                    className="uwshuffle-coffee-button"
                  >
                    <FiHeart className="uwshuffle-icon-button" />
                    Support
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={handleCloseSidebar}
                    className="uwshuffle-close-button"
                  >
                    <FiX className="uwshuffle-icon-button" />
                  </button>
                </div>
              </div>

              {/* Instructions Container */}
              <div
                className={`uwshuffle-instructions-container ${
                  isInstructionsCollapsed ? "collapsed" : ""
                }`}
              >
                <div
                  className="uwshuffle-instructions-header"
                  onClick={handleToggleInstructions}
                >
                  <div className="uwshuffle-instructions-title">
                    Instructions:
                  </div>
                  <FiChevronUp
                    className={`uwshuffle-instructions-caret ${
                      isInstructionsCollapsed
                        ? "uwshuffle-instructions-caret-collapsed"
                        : ""
                    }`}
                  />
                </div>

                {!isInstructionsCollapsed && (
                  <>
                    {/* Instructions Video */}
                    <video
                      className="uwshuffle-instructions-video"
                      muted
                      autoPlay={true}
                      preload="metadata"
                    >
                      <source src={instructionsVideo} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Instructions Steps */}
                    <div className="uwshuffle-instructions-section">
                      <div className="uwshuffle-instruction-display">
                        <div className="uwshuffle-instruction-content">
                          <span className="uwshuffle-instruction-number">
                            {currentInstructionStep + 1}.
                          </span>
                          <span className="uwshuffle-instruction-text">
                            {instructions[currentInstructionStep]}
                          </span>
                        </div>
                        <button
                          onClick={handleNextInstruction}
                          className="uwshuffle-instruction-next"
                          title="Next step"
                        >
                          <FiArrowRight className="uwshuffle-icon-button" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Upload Section */}
              <div className="uwshuffle-upload-section">
                <ScheduleUpload
                  onCoursesUploaded={handleCoursesUploaded}
                  onClearSchedule={handleClearSchedule}
                />
              </div>

              {/* Calendar View with card styling */}
              <div className="uwshuffle-calendar-section">
                <div className="uwshuffle-calendar-card">
                  <div className="uwshuffle-calendar-content">
                    <CalendarView
                      courses={courses}
                      previewCourse={previewCourse}
                    />
                  </div>
                </div>
              </div>

              {/* Footer with modern styling */}
              <div className="uwshuffle-footer">
                {courses.length === 0 ? (
                  <>
                    <FiBook className="uwshuffle-icon" />
                    No courses loaded
                  </>
                ) : (
                  <>
                    <FiBarChart2 className="uwshuffle-icon" />
                    {new Set(courses.map((c) => c.course)).size} course
                    {new Set(courses.map((c) => c.course)).size !== 1
                      ? "s"
                      : ""}{" "}
                    loaded
                  </>
                )}
              </div>
            </div>
          </>
        )}
        {/* Preview Controls with modern card styling */}
        {previewCourse && !isMinimized && (
          <div className="uwshuffle-preview-section">
            <div className="uwshuffle-preview-card">
              <div className="uwshuffle-preview-title">
                <FiClipboard className="uwshuffle-icon" />
                Preview: {previewCourse.course}
              </div>
              <div className="uwshuffle-preview-details">
                {previewCourse.days?.join(", ")} • {previewCourse.start} -{" "}
                {previewCourse.end}
                {previewCourse.location && ` • ${previewCourse.location}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expand button - outside sidebar so it's always visible when minimized */}
      {isMinimized && (
        <button
          onClick={handleExpandSidebar}
          className="uwshuffle-expand-button"
        >
          <img src={logo} alt="UWShuffle" className="uwshuffle-expand-logo" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
