import React from "react";
import {
  FiStar,
  // FiHeart,
  FiHelpCircle,
  FiMoon,
  FiSun,
  FiX,
} from "react-icons/fi";
import logo from "../assets/logo.svg";

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
  return (
    <div className="uwshuffle-action-bar">
      <div className="uwshuffle-action-bar-logo-container">
        <div className="uwshuffle-logo-section">
          <button onClick={onKofiClick} className="uwshuffle-coffee-button">
            <img src={logo} alt="UWShuffle" className="uwshuffle-logo" />
            <div className="uwshuffle-logo-content">
              <div>UWShuffle</div>
              <div className="uwshuffle-action-bar-author-text">
                By @fujacob
              </div>
            </div>
          </button>
        </div>
      </div>
      <div className="uwshuffle-action-bar-buttons">
        <button onClick={onRateClick} className="uwshuffle-coffee-button">
          <FiStar className="uwshuffle-icon-button" />
          Rate
        </button>
        {/* <button onClick={onKofiClick} className="uwshuffle-coffee-button">
          <FiHeart className="uwshuffle-icon-button" />
          Support
        </button> */}
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
        <button onClick={onCloseSidebar} className="uwshuffle-close-button">
          <FiX className="uwshuffle-icon-button" />
        </button>
      </div>
    </div>
  );
};

export default ActionBar;
