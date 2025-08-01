import React, { useState } from "react";
import {
  FiClipboard,
  FiZap,
  FiTrash2,
  FiChevronUp,
  FiUpload,
} from "react-icons/fi";
import type { Course } from "../types";

interface ScheduleUploadProps {
  onCoursesUploaded: (courses: Course[]) => void;
  onClearSchedule: () => void;
}

const ScheduleUpload: React.FC<ScheduleUploadProps> = ({
  onCoursesUploaded,
  onClearSchedule,
}) => {
  const [scheduleText, setScheduleText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const parseScheduleText = (text: string): Course[] => {
    const lines = text
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");
    const courses: Course[] = [];

    let currentCourse: Partial<Course> | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if this line starts a new course (course code pattern)
      const courseMatch = trimmedLine.match(/^([A-Z]{2,4}\s*\d{3}[A-Z]?)/);

      if (courseMatch) {
        // Save previous course if exists
        if (
          currentCourse &&
          currentCourse.course &&
          currentCourse.days &&
          currentCourse.start &&
          currentCourse.end
        ) {
          courses.push(currentCourse as Course);
        }

        // Start new course
        currentCourse = {
          course: courseMatch[1].replace(/\s+/g, " ").trim(),
        };

        // Parse the rest of the line for time and location info
        const timeMatch = trimmedLine.match(
          /([MTWRF]+)\s+(\d{1,2}:\d{2}[AP]M)\s*-\s*(\d{1,2}:\d{2}[AP]M)(?:\s+(.+))?/
        );
        if (timeMatch) {
          const [, dayString, startTime, endTime, location] = timeMatch;
          currentCourse.days = parseDayString(dayString);
          currentCourse.start = convertTo24Hour(startTime);
          currentCourse.end = convertTo24Hour(endTime);
          currentCourse.location = location?.trim();
        }
      } else if (currentCourse) {
        // This might be additional time slot for the same course
        const timeMatch = trimmedLine.match(
          /([MTWRF]+)\s+(\d{1,2}:\d{2}[AP]M)\s*-\s*(\d{1,2}:\d{2}[AP]M)(?:\s+(.+))?/
        );
        if (timeMatch) {
          // Save current course and create a new instance for this time slot
          if (
            currentCourse.course &&
            currentCourse.days &&
            currentCourse.start &&
            currentCourse.end
          ) {
            courses.push(currentCourse as Course);
          }

          const [, dayString, startTime, endTime, location] = timeMatch;
          currentCourse = {
            course: currentCourse.course,
            days: parseDayString(dayString),
            start: convertTo24Hour(startTime),
            end: convertTo24Hour(endTime),
            location: location?.trim(),
          };
        }
      }
    }

    // Add the last course
    if (
      currentCourse &&
      currentCourse.course &&
      currentCourse.days &&
      currentCourse.start &&
      currentCourse.end
    ) {
      courses.push(currentCourse as Course);
    }

    return courses;
  };

  const parseDayString = (dayString: string): string[] => {
    const dayMap: { [key: string]: string } = {
      M: "Mon",
      T: "Tue",
      W: "Wed",
      R: "Thu",
      F: "Fri",
    };

    return dayString
      .split("")
      .map((day) => dayMap[day])
      .filter(Boolean);
  };

  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(/([AP]M)/);
    let [hours] = time.split(":");
    const [, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = (parseInt(hours, 10) + 12).toString();
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const handleUpload = () => {
    if (scheduleText.trim()) {
      const parsedCourses = parseScheduleText(scheduleText);
      onCoursesUploaded(parsedCourses);
      setScheduleText("");
      setIsExpanded(false);

      // Start Quest scraper after schedule upload via postMessage to parent window
      try {
        console.log(
          "UWShuffle: Sending message to start Quest scraper after schedule upload"
        );
        window.parent.postMessage(
          {
            type: "uwshuffle_start_scraper",
            payload: { trigger: "schedule_upload" },
          },
          "*"
        );
      } catch (error) {
        console.error("UWShuffle: Error sending scraper start message:", error);
      }
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: isExpanded ? "20px" : "0",
        }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            flex: 1,
            padding: "12px 16px",
            backgroundColor: "#0052CC",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            boxShadow: "0 1px 2px rgba(0, 82, 204, 0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0066FF";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 82, 204, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#0052CC";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 82, 204, 0.2)";
          }}
        >
          {isExpanded ? (
            <>
              <FiChevronUp style={{ fontSize: "14px" }} />
              Hide Upload
            </>
          ) : (
            <>
              <FiUpload style={{ fontSize: "14px" }} />
              Upload Schedule
            </>
          )}
        </button>
        <button
          onClick={onClearSchedule}
          style={{
            padding: "12px 16px",
            backgroundColor: "white",
            color: "#6B778C",
            border: "1px solid #EBECF0",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F4F5F7";
            e.currentTarget.style.borderColor = "#C1C7D0";
            e.currentTarget.style.color = "#052049";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.borderColor = "#EBECF0";
            e.currentTarget.style.color = "#6B778C";
          }}
        >
          <FiTrash2 style={{ fontSize: "14px" }} />
          Clear
        </button>
      </div>

      {isExpanded && (
        <div
          style={{
            borderTop: "1px solid #EBECF0",
            paddingTop: "20px",
          }}
        >
          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#052049",
                marginBottom: "8px",
              }}
            >
              <FiClipboard style={{ marginRight: "6px", display: "inline" }} />
              Paste Your Schedule
            </label>
            <p
              style={{
                fontSize: "12px",
                color: "#6B778C",
                margin: "0 0 12px 0",
                lineHeight: "1.4",
              }}
            >
              Copy your schedule from Quest and paste it below. We'll
              automatically parse course times and locations.
            </p>
          </div>

          <textarea
            value={scheduleText}
            onChange={(e) => setScheduleText(e.target.value)}
            placeholder="Example format:
AFM 272 MW 10:00AM - 11:20AM HH 2107
F 10:30AM - 11:20AM HH 1101
CS 136 TR 2:30PM - 3:50PM MC 4020"
            style={{
              width: "100%",
              height: "140px",
              padding: "12px",
              border: "1px solid #EBECF0",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily:
                '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
              resize: "vertical",
              marginBottom: "16px",
              backgroundColor: "#FAFBFC",
              color: "#052049",
              lineHeight: "1.5",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0052CC";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(0, 82, 204, 0.1)";
              e.currentTarget.style.backgroundColor = "white";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#EBECF0";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.backgroundColor = "#FAFBFC";
            }}
          />

          <button
            onClick={handleUpload}
            disabled={!scheduleText.trim()}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: scheduleText.trim() ? "#0052CC" : "#C1C7D0",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: scheduleText.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              boxShadow: scheduleText.trim()
                ? "0 1px 2px rgba(0, 82, 204, 0.2)"
                : "none",
            }}
            onMouseEnter={(e) => {
              if (scheduleText.trim()) {
                e.currentTarget.style.backgroundColor = "#0066FF";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 82, 204, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (scheduleText.trim()) {
                e.currentTarget.style.backgroundColor = "#0052CC";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 1px 2px rgba(0, 82, 204, 0.2)";
              }
            }}
          >
            <FiZap style={{ fontSize: "14px" }} />
            Parse Schedule
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleUpload;
