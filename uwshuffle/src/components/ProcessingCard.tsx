import React from "react";
import { FiZap } from "react-icons/fi";

const ProcessingCard: React.FC = () => {
  return (
    <div className="schedule-upload-processing">
      <FiZap className="schedule-upload-processing-icon" />
      <div className="schedule-upload-processing-text">
        Processing schedule...
      </div>
    </div>
  );
};

export default ProcessingCard;