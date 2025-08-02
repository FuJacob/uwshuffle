import React, { useState, useEffect } from "react";
import {
  FiBook,
  FiBarChart2,
  FiHeart,
  FiX,
  FiArrowRight,
  FiStar,
  FiChevronUp,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiExternalLink,
  FiCheckCircle,
} from "react-icons/fi";
import CalendarView from "./CalendarView";
import ScheduleUpload from "./ScheduleUpload";
import type { Course } from "../types";
import logo from "../assets/logo.svg";
import uwflowBackground from "../assets/uwflow_background.svg";

const Sidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>({
    course: "STAT 230",
    days: ["Mon", "Wed", "Fri"],
    start: "11:30",
    end: "12:20",
    location: "UTD 105",
  });
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

  const handleRateClick = () => {
    // Open Chrome Web Store page
    window.open(
      "https://chrome.google.com/webstore/detail/uwshuffle/jgcgjieedkddicejglgncnfepggcepma",
      "_blank",
      "noopener,noreferrer"
    );
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
                <a
                  href="https://uwshuffle.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uwshuffle-action-bar-logo"
                >
                  <img src={logo} alt="UWShuffle" />
                  <span className="uwshuffle-action-bar-title">UWShuffle</span>
                </a>
                <div className="uwshuffle-action-bar-buttons">
                  <button
                    onClick={handleRateClick}
                    className="uwshuffle-coffee-button"
                  >
                    <FiStar className="uwshuffle-icon-button" />
                    Rate us
                  </button>
                  <button
                    onClick={handleKofiClick}
                    className="uwshuffle-coffee-button"
                  >
                    <FiHeart className="uwshuffle-icon-button" />
                    Support us
                  </button>
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
                    <iframe
                      className="uwshuffle-instructions-video"
                      width="560"
                      height="315"
                      src="https://www.youtube.com/embed/VkiwIn8Dcaw?si=40WtIsuVn1EgUHlA&amp;controls=0&autoplay=1&mute=1&loop=1"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>

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

              {/* Stats Section */}
              <div className="uwshuffle-stats-section">
                <div className="uwshuffle-stats-title">Preview Insights</div>
                <div className="uwshuffle-stats-content">
                  {previewCourse ? (
                    <>
                      <div className="uwshuffle-preview-containers">
                        <div className="uwshuffle-course-container">
                          <div className="uwshuffle-course-info-container">
                            <div className="uwshuffle-course-info-title">
                              <span className="uwshuffle-icon">
                                <FiCheckCircle />
                              </span>
                              Course Info:
                            </div>
                            <div className="uwshuffle-course-details">
                              <div className="uwshuffle-course-line">
                                <span className="uwshuffle-icon">
                                  <FiBook />
                                </span>
                                <span className="uwshuffle-value">
                                  {previewCourse.course}
                                </span>
                                <span className="uwshuffle-icon">
                                  <FiMapPin />
                                </span>
                                <span className="uwshuffle-value">
                                  {previewCourse.location}
                                </span>
                              </div>
                              <div className="uwshuffle-course-line">
                                <span className="uwshuffle-icon">
                                  <FiCalendar />
                                </span>
                                <span className="uwshuffle-value">
                                  {previewCourse.days?.join(", ")} •{" "}
                                  {previewCourse.start} - {previewCourse.end}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="uwshuffle-professor-container">
                          <div className="uwshuffle-uwflow-header">
                            <div
                              className="uwshuffle-uwflow-title"
                              style={{
                                backgroundImage: `url(${uwflowBackground})`,
                              }}
                            >
                              <div className="uwshuffle-uwflow-left">
                                <a
                                  href="https://uwflow.com/professor/dr-smith"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="uwshuffle-professor-link"
                                >
                                  <div className="uwshuffle-course-line">
                                    <span className="uwshuffle-icon">
                                      <FiUser />
                                    </span>
                                    <span className="uwshuffle-value">
                                      Dr. Smith
                                    </span>
                                    <span className="uwshuffle-icon">
                                      <FiExternalLink />
                                    </span>
                                  </div>
                                </a>
                              </div>
                              <div className="uwshuffle-uwflow-right">
                                UW Flow
                              </div>
                            </div>
                          </div>
                          <div className="uwshuffle-uwflow-content">
                            <div className="uwshuffle-professor-content">
                              <div className="uwshuffle-professor-circle">
                                <div className="uwshuffle-professor-score">
                                  95%
                                </div>
                              </div>
                              <div className="uwshuffle-professor-info">
                                <div className="uwshuffle-professor-ratings">
                                  <span>Engaging: 4.2</span>
                                  <span>Clarity: 4.5</span>
                                </div>
                                <div className="uwshuffle-professor-reviews">
                                  <span>4 comments</span>
                                  <span>127 reviews</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="uwshuffle-no-preview">
                      <div className="uwshuffle-no-preview-text">
                        No course selected for preview
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Section */}
              <div className="uwshuffle-upload-section">
                <ScheduleUpload
                  onCoursesUploaded={handleCoursesUploaded}
                  onClearSchedule={handleClearSchedule}
                  courses={courses}
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
            </div>
          </>
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
