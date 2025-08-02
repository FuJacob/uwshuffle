import React, { useState, useEffect } from "react";
import {
  FiClipboard,
  FiZap,
  FiTrash2,
  FiRefreshCcw,
  FiBarChart2,
} from "react-icons/fi";
import type { Course } from "../types";
import "./ScheduleUpload.css";

interface ScheduleUploadProps {
  onCoursesUploaded: (courses: Course[]) => void;
  onClearSchedule: () => void;
  courses: Course[];
}

const ScheduleUpload: React.FC<ScheduleUploadProps> = ({
  onCoursesUploaded,
  onClearSchedule,
  courses,
}) => {
  const [scheduleText, setScheduleText] = useState("");
  const [isPasted, setIsPasted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["uwshuffle_courses"], (result) => {
        if (result.uwshuffle_courses) {
          onCoursesUploaded(result.uwshuffle_courses);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  const parseScheduleText = (text: string): Course[] => {
    const lines = text
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");
    const courses: Course[] = [];

    let currentCourse: Partial<Course> | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      const COURSE_CODES = [
        "ACTSC",
        "AE",
        "AFM",
        "AMATH",
        "ANTH",
        "APPLS",
        "ARABIC",
        "ARBUS",
        "ARCH",
        "ARTS",
        "ASL",
        "AVIA",
        "BET",
        "BIOL",
        "BLKST",
        "BME",
        "BUS",
        "CC",
        "CDNST",
        "CFM",
        "CHE",
        "CHEM",
        "CHINA",
        "CI",
        "CIVE",
        "CLAS",
        "CMW",
        "CO",
        "COGSCI",
        "COMM",
        "COMMST",
        "CROAT",
        "CS",
        "DAC",
        "DUTCH",
        "EARTH",
        "EASIA",
      ];
      const COURSE_REGEX = new RegExp(
        `^(${COURSE_CODES.join("|")})\\s*\\d{3}[A-Z]?`,
        "i"
      );
      // Check if this line starts a new course (course code pattern)
      const courseMatch = trimmedLine.match(COURSE_REGEX);
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
          course: courseMatch[0].replace(/\s+/g, " ").trim(),
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

  const handleUpload = (text?: string) => {
    const textToProcess = text || scheduleText;
    if (textToProcess.trim()) {
      setIsProcessing(true);
      try {
        const parsedCourses = parseScheduleText(textToProcess);
        onCoursesUploaded(parsedCourses);
        if (window.chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ uwshuffle_courses: parsedCourses });
        }
        setScheduleText("");
        setIsPasted(true);
      } catch (error) {
        console.error("Error parsing schedule:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.trim()) {
      setScheduleText(pastedText);
      handleUpload(pastedText);
    }
  };

  const handleRefresh = () => {
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
  };

  const handleReset = () => {
    setIsPasted(false);
    setScheduleText("");
    setIsProcessing(false);
    onClearSchedule();
  };

  return (
    <div className="schedule-upload-container">
      {/* Control Panel Title */}
      <div className="schedule-upload-title">Control Panel</div>

      {/* Button Row */}
      <div className="schedule-upload-buttons">
        <button onClick={handleRefresh} className="schedule-upload-secondary">
          <FiRefreshCcw className="schedule-upload-icon-button" />
          Find Swap Options
        </button>
        <button onClick={handleReset} className="schedule-upload-secondary">
          <FiTrash2 className="schedule-upload-icon-button" />
          Clear Schedule
        </button>
      </div>

      {/* Large Paste Card */}
      <div className="schedule-upload-paste-card">
        {isPasted ? (
          <div className="schedule-upload-success">
            <FiZap className="schedule-upload-success-icon" />
            <div className="schedule-upload-success-text">
              Schedule uploaded successfully!
            </div>
          </div>
        ) : isProcessing ? (
          <div className="schedule-upload-processing">
            <FiZap className="schedule-upload-processing-icon" />
            <div className="schedule-upload-processing-text">
              Processing schedule...
            </div>
          </div>
        ) : (
          <div
            className="schedule-upload-paste-zone"
            onPaste={handlePaste}
            tabIndex={0}
          >
            <FiClipboard className="schedule-upload-paste-icon" />
            <div className="schedule-upload-paste-text">
              Paste area: click then Ctrl+V / Cmd+V
            </div>
          </div>
        )}
      </div>

      {/* Courses Loaded Info */}
      <div className="schedule-upload-courses-info">
        {courses.length === 0 ? (
          <>No courses loaded</>
        ) : (
          <>
            <FiBarChart2 className="uwshuffle-icon" />
            {new Set(courses.map((c) => c.course)).size} course
            {new Set(courses.map((c) => c.course)).size !== 1 ? "s" : ""} loaded
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleUpload;
