import React, { useState } from "react";
import {
  FiClipboard,
  FiZap,
  FiTrash2,
  FiChevronUp,
  FiUpload,
} from "react-icons/fi";
import type { Course } from "../types";
import "./ScheduleUpload.css";

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
        className={`schedule-upload-buttons ${isExpanded ? "expanded" : ""}`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="schedule-upload-toggle"
        >
          {isExpanded ? (
            <>
              <FiChevronUp className="schedule-upload-icon-button" />
              Hide Upload
            </>
          ) : (
            <>
              <FiUpload className="schedule-upload-icon-button" />
              Upload Schedule
            </>
          )}
        </button>
        <button onClick={onClearSchedule} className="schedule-upload-clear">
          <FiTrash2 className="schedule-upload-icon-button" />
          Clear
        </button>
      </div>

      {isExpanded && (
        <div className="schedule-upload-form">
          <div className="schedule-upload-form-group">
            <label className="schedule-upload-label">
              <FiClipboard className="schedule-upload-icon" />
              Paste Your Schedule
            </label>
            <p className="schedule-upload-description">
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
            className="schedule-upload-textarea"
          />

          <button
            onClick={handleUpload}
            disabled={!scheduleText.trim()}
            className="schedule-upload-submit"
          >
            <FiZap className="schedule-upload-icon-button" />
            Parse Schedule
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleUpload;
