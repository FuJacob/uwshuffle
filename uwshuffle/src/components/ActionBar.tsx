import React, { useState, useRef } from "react";
import { FiStar, FiHelpCircle, FiMoon, FiSun, FiX } from "react-icons/fi";

interface ActionBarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onRateClick: () => void;
  onKofiClick: () => void;
  onHelpClick: () => void;
  onCloseSidebar: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onRateClick,
  onKofiClick,
  onHelpClick,
  onCloseSidebar,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

  const triggerSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1800);
  };

  // Spin on component mount (page load)
  React.useEffect(() => {
    triggerSpin();
  }, []);

  const handleKofiClick = () => {
    triggerSpin();
    onKofiClick();
  };

  const handleCloseSidebar = () => {
    triggerSpin();
    onCloseSidebar();
  };
  return (
    <div className="uwshuffle-action-bar">
      <div className="uwshuffle-action-bar-logo-container">
        <div className="uwshuffle-logo-section">
          <button onClick={handleKofiClick} className="uwshuffle-coffee-button">
            <img 
              ref={logoRef}
              src="/logo.svg" 
              alt="UWShuffle" 
              className={`uwshuffle-logo ${isSpinning ? 'spinning' : ''}`} 
            />
            <div className="uwshuffle-logo-content">
              <div>UW Shuffle</div>
            </div>
          </button>
        </div>
      </div>
      <div className="uwshuffle-action-bar-buttons">
        <button onClick={onRateClick} className="uwshuffle-coffee-button">
          <FiStar className="uwshuffle-icon-button" />
          Rate
        </button>
        <button onClick={onHelpClick} className="uwshuffle-help-button">
          <FiHelpCircle className="uwshuffle-icon-button" />
        </button>
        <button
          onClick={onToggleDarkMode}
          className="uwshuffle-dark-mode-button"
        >
          {isDarkMode ? (
            <FiSun className="uwshuffle-icon-button" />
          ) : (
            <FiMoon className="uwshuffle-icon-button" />
          )}
        </button>
        <button onClick={handleCloseSidebar} className="uwshuffle-close-button">
          <FiX className="uwshuffle-icon-button" />
        </button>
      </div>
    </div>
  );
};

export default ActionBar;
