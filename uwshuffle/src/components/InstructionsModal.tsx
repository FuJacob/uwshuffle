import React from "react";
import { FiX, FiArrowRight } from "react-icons/fi";

interface InstructionsModalProps {
  isOpen: boolean;
  currentInstructionStep: number;
  onClose: () => void;
  onNextInstruction: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  currentInstructionStep,
  onClose,
  onNextInstruction,
}) => {
  const instructions = [
    'Click "Swap" and enter your target course',
    'Click "Show All" and copy schedule',
    "Paste text into UWShuffle",
  ];

  if (!isOpen) return null;

  return (
    <div className="uwshuffle-modal-overlay" onClick={onClose}>
      <div className="uwshuffle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="uwshuffle-modal-header">
          <h2 className="uwshuffle-modal-title">Instructions</h2>
          <button onClick={onClose} className="uwshuffle-modal-close">
            <FiX className="uwshuffle-icon-button" />
          </button>
        </div>
        <div className="uwshuffle-modal-content">
          {/* Instructions Video */}
          <iframe
            className="uwshuffle-instructions-video"
            width="560"
            height="315"
            src="https://www.youtube.com/embed/VkiwIn8Dcaw?si=40WtIsuVn1EgUHlA&amp;controls=0&autoplay=1&mute=1&loop=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>

          {/* Instructions Steps */}
          <div className="uwshuffle-instructions-section">
            <div className="uwshuffle-instruction-display">
              <div className="uwshuffle-instruction-content">
                <span className="uwshuffle-instruction-number">
                  {currentInstructionStep + 1}.
                </span>
                <span className="uwshuffle-instruction-text">
                  {instructions[currentInstructionStep]}
                </span>
              </div>
              <button
                onClick={onNextInstruction}
                className="uwshuffle-instruction-next"
                title="Next step"
              >
                <FiArrowRight className="uwshuffle-icon-button" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;