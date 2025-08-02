import React from "react";
import { FiBook, FiRefreshCcw, FiCheckCircle } from "react-icons/fi";
import type { Course } from "../types";

interface CurrentStepProps {
  courses: Course[];
  previewCourse: Course | null;
}

const CurrentStep: React.FC<CurrentStepProps> = ({
  courses,
  previewCourse,
}) => {
  // Determine current step based on state
  const getCurrentStep = () => {
    if (courses.length === 0) {
      return 0; // Upload step
    } else if (!previewCourse) {
      return 1; // Find swap step
    } else {
      return 2; // All set step
    }
  };

  const steps = [
    { text: "1/3: Upload current schedule", icon: FiBook },
    { text: "2/3: Click Find Swap", icon: FiRefreshCcw },
    { text: "Done: Ready to Swap!", icon: FiCheckCircle },
  ];

  const currentStep = getCurrentStep();
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="uwshuffle-mini-progress">
      <div className="uwshuffle-mini-progress-bar">
        <div
          className="uwshuffle-mini-progress-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="uwshuffle-mini-step-indicator">
        {React.createElement(steps[currentStep].icon, {
          className: "uwshuffle-mini-step-icon",
        })}
        <span className="uwshuffle-mini-step-text">
          {steps[currentStep].text}
        </span>
      </div>
    </div>
  );
};

export default CurrentStep;
