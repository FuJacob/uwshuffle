import React from "react";
import { FiClipboard } from "react-icons/fi";

interface PasteZoneProps {
  onPaste: (e: React.ClipboardEvent) => void;
  isActive?: boolean;
}

const PasteZone: React.FC<PasteZoneProps> = ({ onPaste, isActive = false }) => {
  return (
    <div
      className={`schedule-upload-paste-zone ${isActive ? "active" : ""}`}
      onPaste={onPaste}
      tabIndex={0}
    >
      <FiClipboard className="schedule-upload-paste-icon" />
      <div className="schedule-upload-paste-text">
        Paste current schedule{" "}
        <span className="keyboard-shortcut">(Click + ⌃ Ctrl+V / ⌘ Cmd+V)</span>
      </div>
    </div>
  );
};

export default PasteZone;
