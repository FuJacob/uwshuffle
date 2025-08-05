import React, { useMemo, useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
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
  const [isAnimating, setIsAnimating] = useState(false);

  const uniqueCourses = useMemo(() => 
    Array.from(new Set(courses.map((c) => c.course))).map(
      (courseName) => courses.find((c) => c.course === courseName)!
    ), [courses]
  );

  useEffect(() => {
    if (showDropdown) {
      setIsAnimating(true);
    }
  }, [showDropdown]);

  const handleCourseSelect = (course: Course | "None") => {
    setIsAnimating(false);
    setTimeout(() => {
      onCourseSelect(course);
    }, 200);
  };

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
        {showDropdown ? (
          <FiChevronUp className="schedule-upload-icon-button" />
        ) : (
          <FiChevronDown className="schedule-upload-icon-button" />
        )}
        {selectedCourse === "None"
          ? "None (show all courses)"
          : selectedCourse
          ? selectedCourse.course
          : "Now, pick the course you want to swap"}
      </button>
      
      {showDropdown && courses.length > 0 && (
        <div className={`course-selection-buttons ${isAnimating ? 'animating' : ''}`}>
          <button
            key="none-option"
            onClick={() => handleCourseSelect("None")}
            className={`course-selection-button ${
              selectedCourse === "None" ? "selected" : ""
            }`}
            style={{ animationDelay: '0ms' }}
          >
            None (show all courses)
          </button>
          {uniqueCourses.map((course, index) => (
            <button
              key={course.course}
              onClick={() => handleCourseSelect(course)}
              className={`course-selection-button ${
                selectedCourse !== "None" &&
                selectedCourse?.course === course.course
                  ? "selected"
                  : ""
              }`}
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
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
