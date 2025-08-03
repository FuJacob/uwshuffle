import React from "react";
import { FiCheck, FiTrash2 } from "react-icons/fi";
import type { Course } from "../types";

interface UploadSuccessCardProps {
  courses: Course[];
  onReset: () => void;
  showClearSuccess: boolean;
}

const UploadSuccessCard: React.FC<UploadSuccessCardProps> = ({
  courses,
  onReset,
  showClearSuccess,
}) => {
  const uniqueCourseCount = new Set(courses.map((c) => c.course)).size;

  return (
    <div className="schedule-upload-success-container">
      <div className="schedule-upload-success">
        <FiCheck className="schedule-upload-success-icon" />
        <div className="schedule-upload-success-text">
          {uniqueCourseCount} course{uniqueCourseCount !== 1 ? "s" : ""}{" "}
          uploaded
        </div>
      </div>
      <button
        onClick={onReset}
        className="schedule-upload-secondary schedule-upload-clear-button"
        disabled={courses.length === 0}
        aria-disabled={courses.length === 0}
        style={{
          opacity: courses.length === 0 ? 0.5 : 1,
          cursor: courses.length === 0 ? "not-allowed" : "pointer",
        }}
        data-tooltip-id={
          courses.length === 0 ? "clear-schedule-disabled-tooltip" : undefined
        }
        data-tooltip-content={
          courses.length === 0
            ? "Upload your schedule first to clear it"
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
  );
};

export default UploadSuccessCard;
