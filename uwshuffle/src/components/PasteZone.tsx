import React from "react";
import { FiClipboard, FiX } from "react-icons/fi";

interface PasteZoneProps {
  onPaste: (e: React.ClipboardEvent) => void;
  isActive?: boolean;
  isError?: boolean;
}

const PasteZone: React.FC<PasteZoneProps> = ({ onPaste, isActive = false, isError = false }) => {
  return (
    <div
      className={`schedule-upload-paste-zone ${isActive ? "active" : ""} ${isError ? "error" : ""}`}
      onPaste={onPaste}
      tabIndex={0}
    >
      {isError ? (
        <FiX className="schedule-upload-paste-icon" />
      ) : (
        <FiClipboard className="schedule-upload-paste-icon" />
      )}
      <div className="schedule-upload-paste-text">
        {isError ? "Invalid schedule format" : "Paste current schedule (Click + ⌃ Ctrl+V / ⌘ Cmd+V)"}
      </div>
    </div>
  );
};

export default PasteZone;
