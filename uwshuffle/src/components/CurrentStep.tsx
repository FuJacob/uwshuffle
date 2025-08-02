import React from "react";
import { FiBook, FiRefreshCcw, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import type { Course } from "../types";

interface CurrentStepProps {
  courses: Course[];
  previewCourse: Course | null;
}

const CurrentStep: React.FC<CurrentStepProps> = ({ courses, previewCourse }) => {
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
    { text: "Upload schedule", icon: FiBook },
    { text: "Find swap options", icon: FiRefreshCcw },
    { text: "Ready to swap", icon: FiCheckCircle },
  ];

  return (
    <div className="uwshuffle-current-step-section">
      <div className="uwshuffle-current-step-title">Current Step:</div>
      <div className="uwshuffle-current-step-progress">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div key={index} className="uwshuffle-step-container">
              <div
                className={`uwshuffle-step ${
                  getCurrentStep() === index ? "uwshuffle-step-active" : ""
                }`}
              >
                <IconComponent className="uwshuffle-step-icon" />
                {step.text}
              </div>
              {index < steps.length - 1 && (
                <FiArrowRight className="uwshuffle-step-arrow" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CurrentStep;