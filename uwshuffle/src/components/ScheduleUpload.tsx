import React, { useState, useEffect } from "react";
import {
  FiClipboard,
  FiZap,
  FiTrash2,
  FiRefreshCcw,
  FiCheck,
  FiPlus,
  FiMinus,
  FiChevronDown,
  FiHelpCircle,
} from "react-icons/fi";
import type { Course } from "../types";
import { courseCodes } from "../constants/courseCodes";
import { Tooltip } from "react-tooltip";
import "./ScheduleUpload.css";
import CurrentStep from "./CurrentStep";

interface ScheduleUploadProps {
  setScheduleUploadError: (error: string | null) => void;
  onCoursesUploaded: (courses: Course[]) => void;
  onClearSchedule: () => void;
  courses: Course[];
  onCourseSelectedToSwap: (course: Course | null) => void;
  selectedCourseToSwap: Course | null;
}

const ScheduleUpload: React.FC<ScheduleUploadProps> = ({
  setScheduleUploadError,
  onCoursesUploaded,
  onClearSchedule,
  courses,
  onCourseSelectedToSwap,
  selectedCourseToSwap,
}) => {
  const [scheduleText, setScheduleText] = useState("");
  const [isPasted, setIsPasted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFindSuccess, setShowFindSuccess] = useState(false);
  const [showClearSuccess, setShowClearSuccess] = useState(false);
  const [isActionCenterCollapsed, setIsActionCenterCollapsed] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

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
      const COURSE_REGEX = new RegExp(
        `^(${Array.from(courseCodes).join("|")})\\s*\\d{3}[A-Z]?`,
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
      M: "Mo",
      T: "Tu",
      W: "We",
      R: "Th",
      F: "Fr",
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
        if (parsedCourses.length === 0) {
          setScheduleUploadError("Invalid schedule format");
          return;
        }
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
      setShowFindSuccess(true);
      setTimeout(() => setShowFindSuccess(false), 2000);
    } catch (error) {
      console.error("UWShuffle: Error sending scraper start message:", error);
    }
  };

  const handleReset = () => {
    setIsPasted(false);
    setScheduleText("");
    setIsProcessing(false);
    onClearSchedule();
    setShowClearSuccess(true);
    setTimeout(() => setShowClearSuccess(false), 2000);
  };

  const handleCourseSelect = (course: Course) => {
    onCourseSelectedToSwap(course);
    setShowCourseDropdown(false);
  };

  const uniqueCourses = Array.from(new Set(courses.map((c) => c.course))).map(
    (courseName) => courses.find((c) => c.course === courseName)!
  );

  return (
    <div className="schedule-upload-container">
      {/* Control Panel Title */}
      <div className="schedule-upload-title-container">
        <div className="schedule-upload-title">
          Action Center
          <FiHelpCircle
            className="uwshuffle-help-icon"
            data-tooltip-id="action-center-tooltip"
            data-tooltip-content="Upload your schedule, find swap options, and clear your schedule. The central hub for all schedule management actions."
          />
          <CurrentStep courses={courses} previewCourse={selectedCourseToSwap} />
        </div>
        <button
          onClick={() => setIsActionCenterCollapsed(!isActionCenterCollapsed)}
          className="uwshuffle-collapse-button"
        >
          {isActionCenterCollapsed ? <FiPlus /> : <FiMinus />}
        </button>
      </div>
      <Tooltip
        id="action-center-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="find-swap-disabled-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="clear-schedule-disabled-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="select-course-disabled-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />

      {/* Button Row */}
      {!isActionCenterCollapsed && (
        <>
          <div className="schedule-upload-buttons">
            <button
              onClick={handleRefresh}
              className="schedule-upload-primary"
              disabled={courses.length === 0}
              aria-disabled={courses.length === 0}
              style={{
                opacity: courses.length === 0 ? 0.5 : 1,
                cursor: courses.length === 0 ? "not-allowed" : "pointer",
              }}
              data-tooltip-id={
                courses.length === 0 ? "find-swap-disabled-tooltip" : undefined
              }
              data-tooltip-content={
                courses.length === 0
                  ? "Please upload your schedule first to find swap options"
                  : undefined
              }
            >
              {showFindSuccess ? (
                <FiCheck className="schedule-upload-icon-button" />
              ) : (
                <FiRefreshCcw className="schedule-upload-icon-button" />
              )}
              Get my Swaps!
            </button>
            <button
              onClick={handleReset}
              className="schedule-upload-secondary schedule-upload-clear-button"
              disabled={courses.length === 0}
              aria-disabled={courses.length === 0}
              style={{
                opacity: courses.length === 0 ? 0.5 : 1,
                cursor: courses.length === 0 ? "not-allowed" : "pointer",
              }}
              data-tooltip-id={
                courses.length === 0
                  ? "clear-schedule-disabled-tooltip"
                  : undefined
              }
              data-tooltip-content={
                courses.length === 0
                  ? "No schedule to clear - please upload your courses first"
                  : undefined
              }
            >
              {showClearSuccess ? (
                <FiCheck className="schedule-upload-icon-button" />
              ) : (
                <FiTrash2 className="schedule-upload-icon-button" />
              )}
              Clear Schedule
            </button>
          </div>

          {/* Large Paste Card */}
          <div className="schedule-upload-paste-card">
            {isPasted ? (
              <div className="schedule-upload-success">
                <FiCheck className="schedule-upload-success-icon" />
                <div className="schedule-upload-success-text">
                  {" "}
                  {new Set(courses.map((c) => c.course)).size} course
                  {new Set(courses.map((c) => c.course)).size !== 1
                    ? "s"
                    : ""}{" "}
                  uploaded successfully
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
                  Paste your current schedule here (Click + Ctrl+V / Cmd+V)
                </div>
              </div>
            )}
          </div>

          {/* Course Selection Dropdown */}
          <div className="schedule-upload-course-dropdown-container">
            <button
              onClick={() => setShowCourseDropdown(!showCourseDropdown)}
              className="schedule-upload-secondary"
              disabled={courses.length === 0}
              aria-disabled={courses.length === 0}
              style={{
                opacity: courses.length === 0 ? 0.5 : 1,
                cursor: courses.length === 0 ? "not-allowed" : "pointer",
              }}
              data-tooltip-id={
                courses.length === 0
                  ? "select-course-disabled-tooltip"
                  : undefined
              }
              data-tooltip-content={
                courses.length === 0
                  ? "Upload your schedule first to select a course to swap"
                  : undefined
              }
            >
              <FiChevronDown className="schedule-upload-icon-button" />
              {selectedCourseToSwap
                ? selectedCourseToSwap.course
                : "Now, pick the course you want to swap"}
            </button>
            {showCourseDropdown && courses.length > 0 && (
              <div className="schedule-upload-dropdown">
                {uniqueCourses.map((course) => (
                  <button
                    key={course.course}
                    onClick={() => handleCourseSelect(course)}
                    className={`schedule-upload-dropdown-item ${
                      selectedCourseToSwap?.course === course.course
                        ? "selected"
                        : ""
                    }`}
                  >
                    {course.course}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleUpload;
