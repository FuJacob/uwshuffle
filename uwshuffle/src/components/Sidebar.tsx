import React, { useState, useEffect } from "react";
import {
  FiClipboard,
  FiCalendar,
  FiBook,
  FiBarChart2,
  FiCoffee,
} from "react-icons/fi";
import CalendarView from "./CalendarView";
import ScheduleUpload from "./ScheduleUpload";
import type { Course } from "../types";

const Sidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

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

  // addPreviewCourse is handled via message listener

  return (
    <div className="uwshuffle-sidebar">
      {/* Header with elevation */}
      <div className="uwshuffle-header-container">
        <div className="uwshuffle-header">
          <div className="uwshuffle-header-content">
            <h1 className="uwshuffle-title">UWShuffle</h1>
            <p className="uwshuffle-subtitle">Quest Class Schedule Helper</p>
          </div>

          {/* Coffee Button */}
          <a
            href="https://buymeacoffee.com/uwshuffle"
            target="_blank"
            rel="noopener noreferrer"
            className="uwshuffle-coffee-button"
          >
            <FiCoffee className="uwshuffle-icon-button" />
            Buy me coffee $1
          </a>

          {/* Upload Section with card styling */}
        </div>
        <div className="uwshuffle-upload-section">
          <div className="uwshuffle-upload-card">
            <ScheduleUpload
              onCoursesUploaded={handleCoursesUploaded}
              onClearSchedule={handleClearSchedule}
            />
          </div>
        </div>
      </div>
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
          <div className="uwshuffle-calendar-header">
            <h3 className="uwshuffle-calendar-title">
              <FiCalendar className="uwshuffle-icon" />
              Weekly Schedule
            </h3>
          </div>
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
            {courses.length} course{courses.length !== 1 ? "s" : ""} loaded
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
