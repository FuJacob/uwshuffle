import React from "react";
import { FiChevronDown } from "react-icons/fi";
import type { Course } from "../types";

interface CourseDropdownProps {
  courses: Course[];
  selectedCourse: Course | null | "None";
  onCourseSelect: (course: Course | "None") => void;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  disabled?: boolean;
  tooltipId?: string;
  tooltipContent?: string;
  isActive?: boolean;
}

const CourseDropdown: React.FC<CourseDropdownProps> = ({
  courses,
  selectedCourse,
  onCourseSelect,
  showDropdown,
  onToggleDropdown,
  disabled = false,
  tooltipId,
  tooltipContent,
  isActive = false,
}) => {
  const uniqueCourses = Array.from(new Set(courses.map((c) => c.course))).map(
    (courseName) => courses.find((c) => c.course === courseName)!
  );

  return (
    <div className="schedule-upload-course-dropdown-container">
      <button
        onClick={onToggleDropdown}
        className={`schedule-upload-secondary-full ${isActive ? "active" : ""}`}
        disabled={disabled}
        aria-disabled={disabled}
        style={{
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        data-tooltip-id={disabled ? tooltipId : undefined}
        data-tooltip-content={disabled ? tooltipContent : undefined}
      >
        <FiChevronDown className="schedule-upload-icon-button" />
        {selectedCourse === "None"
          ? "None (show all courses)"
          : selectedCourse
          ? selectedCourse.course
          : "Now, pick the course you want to swap"}
      </button>
      {showDropdown && courses.length > 0 && (
        <div className="schedule-upload-dropdown">
          <button
            key="none-option"
            onClick={() => onCourseSelect("None")}
            className={`schedule-upload-dropdown-item ${
              selectedCourse === "None" ? "selected" : ""
            }`}
          >
            None (show all courses)
          </button>
          {uniqueCourses.map((course) => (
            <button
              key={course.course}
              onClick={() => onCourseSelect(course)}
              className={`schedule-upload-dropdown-item ${
                selectedCourse !== "None" &&
                selectedCourse?.course === course.course
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
  );
};

export default CourseDropdown;
