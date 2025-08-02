import React, { useState, useEffect } from "react";
import {
  FiBook,
  FiBarChart2,
  FiHeart,
  FiX,
  FiArrowRight,
  FiStar,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiCheckCircle,
  FiMessageSquare,
  FiHelpCircle,
  FiFileText,
  FiRefreshCcw,
  FiMoon,
  FiSun,
  FiUsers,
  FiDownload,
} from "react-icons/fi";
import CalendarView from "./CalendarView";
import ScheduleUpload from "./ScheduleUpload";
import type { Course } from "../types";
import logo from "../assets/logo.svg";
import uwflowIcon from "../assets/uwflow.png";
import { exportCurrentSchedule, exportScheduleWithSwap } from "../utils/icsExport";

const Sidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>({
    course: "STAT 230",
    days: ["Mon", "Wed", "Fri"],
    start: "11:30",
    end: "12:20",
    location: "UTD 105",
    section: "001",
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [currentInstructionStep, setCurrentInstructionStep] =
    useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (!window.chrome || !chrome.storage || !chrome.storage.local) {
      return;
    }
    chrome.storage.local
      .get("uwshuffle_onboarding_completed")
      .then((result) => {
        if (result.uwshuffle_onboarding_completed == true) {
          setIsModalOpen(false);
        } else {
          setIsModalOpen(true);
        }
      });
  }, []);

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ uwshuffle_onboarding_completed: true });
    }
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Apply theme to document
    if (newDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  // Determine current step based on state
  const getCurrentStep = () => {
    if (courses.length === 0) {
      return 0; // Upload step
    } else if (!previewCourse) {
      return 1; // Find swap step
    } else {
      return 2; // All set step
    }
  };

  const steps = [
    { text: "Upload schedule", icon: FiBook },
    { text: "Find swap options", icon: FiRefreshCcw },
    { text: "Ready to swap", icon: FiCheckCircle },
  ];

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
                <div className="uwshuffle-action-bar-logo-container">
                  <div className="uwshuffle-logo-section">
                    <a
                      href="https://uwshuffle.ca"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="uwshuffle-action-bar-logo"
                    >
                      <img src={logo} alt="UWShuffle" />
                      <span className="uwshuffle-action-bar-title">
                        UWShuffle
                      </span>
                    </a>
                    <div className="uwshuffle-action-bar-author-text">
                      Created by a UW student
                    </div>
                  </div>
                </div>
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
                    onClick={handleOpenModal}
                    className="uwshuffle-help-button"
                  >
                    <FiHelpCircle className="uwshuffle-icon-button" />
                    Help
                  </button>
                  <button
                    onClick={handleToggleDarkMode}
                    className="uwshuffle-dark-mode-button"
                  >
                    {isDarkMode ? (
                      <FiSun className="uwshuffle-icon-button" />
                    ) : (
                      <FiMoon className="uwshuffle-icon-button" />
                    )}
                    <span className="uwshuffle-dark-mode-label">
                      {isDarkMode ? "Light" : "Dark"}
                    </span>
                  </button>
                  <button
                    onClick={handleCloseSidebar}
                    className="uwshuffle-close-button"
                  >
                    <FiX className="uwshuffle-icon-button" />
                  </button>
                </div>
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
                                <div className="uwshuffle-course-item">
                                  <span className="uwshuffle-icon">
                                    <FiBook />
                                  </span>
                                  <span className="uwshuffle-value">
                                    {previewCourse.course}
                                  </span>
                                </div>
                                <div className="uwshuffle-course-item">
                                  <span className="uwshuffle-icon">
                                    <FiUsers />
                                  </span>
                                  <span className="uwshuffle-value">
                                    {previewCourse.section}
                                  </span>
                                </div>
                              </div>
                              <div className="uwshuffle-course-line">
                                <div className="uwshuffle-course-item">
                                  <span className="uwshuffle-icon">
                                    <FiCalendar />
                                  </span>
                                  <span className="uwshuffle-value">
                                    {previewCourse.days?.join(", ")} •{" "}
                                    {previewCourse.start} - {previewCourse.end}
                                  </span>
                                </div>
                                <div className="uwshuffle-course-item">
                                  <span className="uwshuffle-icon">
                                    <FiMapPin />
                                  </span>
                                  <span className="uwshuffle-value">
                                    {previewCourse.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="uwshuffle-professor-container">
                          <div className="uwshuffle-uwflow-header">
                            <div className="uwshuffle-uwflow-title">
                              <div className="uwshuffle-uwflow-left">
                                <div className="uwshuffle-course-line">
                                  <span className="uwshuffle-icon">
                                    <FiUser />
                                  </span>
                                  <span className="uwshuffle-value">
                                    Dr. Smith
                                  </span>
                                </div>
                              </div>
                              <div className="uwshuffle-uwflow-right">
                                <a
                                  href="https://uwflow.com/professor/dr-smith"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="uwshuffle-professor-link uwshuffle-uwflow-link"
                                >
                                  Go to{" "}
                                  <img
                                    src={uwflowIcon}
                                    alt="UW Flow"
                                    className="uwshuffle-uwflow-icon"
                                  />
                                  UW Flow
                                </a>
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
                                  <span>Engaging: 84%</span>
                                  <span>
                                    <FiMessageSquare className="uwshuffle-icon" />
                                    4
                                  </span>
                                </div>
                                <div className="uwshuffle-professor-reviews">
                                  <span>Clarity: 90%</span>
                                  <span>
                                    <FiBarChart2 className="uwshuffle-icon" />
                                    127
                                  </span>
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

              {/* Current Step Section */}
              <div className="uwshuffle-current-step-section">
                <div className="uwshuffle-current-step-title">
                  Current Step:
                </div>
                <div className="uwshuffle-current-step-progress">
                  {steps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                      <div key={index} className="uwshuffle-step-container">
                        <div
                          className={`uwshuffle-step ${
                            getCurrentStep() === index
                              ? "uwshuffle-step-active"
                              : ""
                          }`}
                        >
                          <IconComponent className="uwshuffle-step-icon" />
                          {step.text}
                        </div>
                        {index < steps.length - 1 && (
                          <FiArrowRight className="uwshuffle-step-arrow" />
                        )}
                      </div>
                    );
                  })}
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
                  <div className="uwshuffle-calendar-header">
                    <div className="uwshuffle-calendar-title">Schedule</div>
                    <div className="uwshuffle-calendar-actions">
                      <button
                        className="uwshuffle-export-button"
                        disabled={courses.length === 0}
                        aria-disabled={courses.length === 0}
                        onClick={() => exportCurrentSchedule(courses)}
                        style={{
                          opacity: courses.length === 0 ? 0.5 : 1,
                          cursor:
                            courses.length === 0 ? "not-allowed" : "pointer",
                        }}
                      >
                        <FiDownload className="uwshuffle-icon-button" />
                        Export Current Schedule
                      </button>
                      <button
                        className="uwshuffle-export-button"
                        disabled={courses.length === 0 || !previewCourse}
                        aria-disabled={courses.length === 0 || !previewCourse}
                        onClick={() => previewCourse && exportScheduleWithSwap(courses, previewCourse)}
                        style={{
                          opacity:
                            courses.length === 0 || !previewCourse ? 0.5 : 1,
                          cursor:
                            courses.length === 0 || !previewCourse
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <FiRefreshCcw className="uwshuffle-icon-button" />
                        Export With Swapped Class
                      </button>
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
                      />
                    )}
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

      {/* Instructions Modal */}
      {isModalOpen && (
        <div className="uwshuffle-modal-overlay" onClick={handleCloseModal}>
          <div className="uwshuffle-modal" onClick={(e) => e.stopPropagation()}>
            <div className="uwshuffle-modal-header">
              <h2 className="uwshuffle-modal-title">Instructions</h2>
              <button
                onClick={handleCloseModal}
                className="uwshuffle-modal-close"
              >
                <FiX className="uwshuffle-icon-button" />
              </button>
            </div>
            <div className="uwshuffle-modal-content">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
