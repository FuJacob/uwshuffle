import React, { useState, useEffect } from "react";
import {
  FiClipboard,
  FiCheck,
  FiX,
  FiCalendar,
  FiBook,
  FiBarChart2,
} from "react-icons/fi";
import CalendarView from "./CalendarView";
import ScheduleUpload from "./ScheduleUpload";
import type { Course } from "../types";

const Sidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  // Load courses from Chrome storage
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["uwshuffle_courses"], (result) => {
        if (result.uwshuffle_courses) {
          setCourses(result.uwshuffle_courses);
        }
      });
    }
  }, []);

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

  // Save courses to Chrome storage whenever courses change
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ uwshuffle_courses: courses });
    }
  }, [courses]);

  const handleCoursesUploaded = (newCourses: Course[]) => {
    setCourses(newCourses);
  };

  const handleClearSchedule = () => {
    setCourses([]);
  };

  // addPreviewCourse is handled via message listener

  const confirmPreviewCourse = () => {
    if (previewCourse) {
      setCourses([...courses, previewCourse]);
      setPreviewCourse(null);
    }
  };

  const cancelPreviewCourse = () => {
    setPreviewCourse(null);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F4F5F7",
        overflow: "hidden",
        fontFamily:
          '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header with elevation */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          borderBottom: "1px solid #EBECF0",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "700",
            color: "#052049",
            letterSpacing: "-0.5px",
          }}
        >
          UWShuffle
        </h1>
        <p
          style={{
            margin: "6px 0 0 0",
            fontSize: "14px",
            color: "#6B778C",
            fontWeight: "400",
          }}
        >
          Quest Class Schedule Helper
        </p>
      </div>

      {/* Upload Section with card styling */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#F4F5F7",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
            border: "1px solid #EBECF0",
          }}
        >
          <ScheduleUpload
            onCoursesUploaded={handleCoursesUploaded}
            onClearSchedule={handleClearSchedule}
          />
        </div>
      </div>

      {/* Preview Controls with modern card styling */}
      {previewCourse && (
        <div
          style={{
            padding: "0 20px 20px 20px",
            backgroundColor: "#F4F5F7",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "#FFF4E6",
              border: "1px solid #FFE0B2",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div
              style={{
                marginBottom: "12px",
                fontWeight: "600",
                color: "#052049",
                fontSize: "14px",
              }}
            >
              <FiClipboard style={{ marginRight: "6px", display: "inline" }} />
              Preview: {previewCourse.course}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#6B778C",
                marginBottom: "16px",
                lineHeight: "1.4",
              }}
            >
              {previewCourse.days?.join(", ")} • {previewCourse.start} -{" "}
              {previewCourse.end}
              {previewCourse.location && ` • ${previewCourse.location}`}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={confirmPreviewCourse}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#0052CC",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 2px rgba(0, 82, 204, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0066FF";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0, 82, 204, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0052CC";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0, 82, 204, 0.2)";
                }}
              >
                <FiCheck style={{ fontSize: "14px" }} />
                Add to Schedule
              </button>
              <button
                onClick={cancelPreviewCourse}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "white",
                  color: "#6B778C",
                  border: "1px solid #EBECF0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F4F5F7";
                  e.currentTarget.style.borderColor = "#C1C7D0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#EBECF0";
                }}
              >
                <FiX style={{ fontSize: "14px" }} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View with card styling */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "0 20px 20px 20px",
          backgroundColor: "#F4F5F7",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
            border: "1px solid #EBECF0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #EBECF0",
              backgroundColor: "#FAFBFC",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "600",
                color: "#052049",
              }}
            >
              <FiCalendar style={{ marginRight: "6px", display: "inline" }} />
              Weekly Schedule
            </h3>
          </div>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "16px",
              // Custom scrollbar
              scrollbarWidth: "thin",
              scrollbarColor: "#C1C7D0 transparent",
            }}
          >
            <CalendarView courses={courses} previewCourse={previewCourse} />
          </div>
        </div>
      </div>

      {/* Footer with modern styling */}
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "white",
          borderTop: "1px solid #EBECF0",
          fontSize: "13px",
          color: "#6B778C",
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        {courses.length === 0 ? (
          <>
            <FiBook style={{ marginRight: "6px", display: "inline" }} />
            No courses loaded
          </>
        ) : (
          <>
            <FiBarChart2 style={{ marginRight: "6px", display: "inline" }} />
            {courses.length} course{courses.length !== 1 ? "s" : ""} loaded
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
