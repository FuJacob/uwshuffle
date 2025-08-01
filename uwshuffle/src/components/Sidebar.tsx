import React, { useState, useEffect } from "react";
import {
  FiClipboard,
  FiBook,
  FiBarChart2,
  FiHeart,
  FiX,
  FiChevronUp,
} from "react-icons/fi";
import CalendarView from "./CalendarView";
import ScheduleUpload from "./ScheduleUpload";
import type { Course } from "../types";

const Sidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

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
  };

  const handleExpandSidebar = () => {
    setIsMinimized(false);
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
            {/* Header with elevation */}
            <div className="uwshuffle-header-container">
              <div className="uwshuffle-header">
                <div className="uwshuffle-header-content">
                  <h1 className="uwshuffle-title">UWShuffle</h1>
                  <p className="uwshuffle-subtitle">
                    Quest Class Schedule Helper
                  </p>
                </div>

                <div className="uwshuffle-header-actions">
                  {/* Ko-fi Button */}
                  <button
                    onClick={handleKofiClick}
                    className="uwshuffle-coffee-button"
                  >
                    <FiHeart className="uwshuffle-icon-button" />
                    Support us
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
            </div>
            <div className="uwshuffle-upload-section">
              <div className="uwshuffle-upload-card">
                <ScheduleUpload
                  onCoursesUploaded={handleCoursesUploaded}
                  onClearSchedule={handleClearSchedule}
                />
              </div>
            </div>
          </>
        )}
        {/* Preview Controls with modern card styling */}
        {previewCourse && (
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

        {/* Calendar View with card styling */}
        <div className="uwshuffle-calendar-section">
          <div className="uwshuffle-calendar-card">
            <div className="uwshuffle-calendar-content">
              <CalendarView courses={courses} previewCourse={previewCourse} />
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
              {new Set(courses.map((c) => c.course)).size !== 1 ? "s" : ""}{" "}
              loaded
            </>
          )}
        </div>

        {/* Minimized expand button */}
        {isMinimized && (
          <button
            onClick={handleExpandSidebar}
            className="uwshuffle-expand-button"
          >
            <FiChevronUp className="uwshuffle-icon-button" />
          </button>
        )}
      </div>
    </>
  );
};

export default Sidebar;
