import React from "react";
import { FiBook, FiRefreshCcw, FiCheckCircle } from "react-icons/fi";
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

  const currentStep = getCurrentStep();
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="uwshuffle-current-step-section">
      <div className="uwshuffle-current-step-title">Current Step:</div>
      
      {/* Progress Bar with embedded labels */}
      <div className="uwshuffle-progress-bar">
        {/* Background progress fill */}
        <div 
          className="uwshuffle-progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Step labels overlaid on the bar - All steps on wider screens */}
        <div className="uwshuffle-step-labels uwshuffle-step-labels-full">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <React.Fragment key={index}>
                <div 
                  className={`uwshuffle-step-label ${
                    index <= currentStep ? "uwshuffle-step-label-active" : ""
                  }`}
                >
                  <IconComponent className="uwshuffle-step-icon" />
                  <span className="uwshuffle-step-text">{step.text}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="uwshuffle-step-arrow">→</div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Step Only - Narrow screens */}
        <div className="uwshuffle-step-labels uwshuffle-step-labels-current">
          <div className="uwshuffle-step-label uwshuffle-step-label-active">
            {React.createElement(steps[currentStep].icon, { className: "uwshuffle-step-icon" })}
            <span className="uwshuffle-step-text">{steps[currentStep].text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentStep;