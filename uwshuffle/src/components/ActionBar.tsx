import React from "react";
import {
  FiStar,
  // FiHeart,
  FiHelpCircle,
  FiMoon,
  FiSun,
  FiX,
} from "react-icons/fi";
import { Tooltip } from "react-tooltip";

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
            <img src="/logo.svg" alt="UWShuffle" className="uwshuffle-logo" />
            <div className="uwshuffle-logo-content">
              <div>UWShuffle</div>
              {/* <div className="uwshuffle-action-bar-author-text">
                By @fujacob
              </div> */}
            </div>
          </button>
        </div>
      </div>
      <div className="uwshuffle-action-bar-buttons">
        <button
          onClick={onRateClick}
          className="uwshuffle-coffee-button"
          data-tooltip-id="rate-button-tooltip"
          data-tooltip-content="Rate UWShuffle on the Chrome Web Store to help other students discover this tool!"
        >
          <FiStar className="uwshuffle-icon-button" />
          Rate
        </button>
        {/* <button onClick={onKofiClick} className="uwshuffle-coffee-button">
          <FiHeart className="uwshuffle-icon-button" />
          Support
        </button> */}
        <button
          onClick={onHelpClick}
          className="uwshuffle-help-button"
          data-tooltip-id="help-button-tooltip"
          data-tooltip-content="Take a quick tour to learn how to use UWShuffle step by step"
        >
          <FiHelpCircle className="uwshuffle-icon-button" />
        </button>
        <button
          onClick={onToggleDarkMode}
          className="uwshuffle-dark-mode-button"
          data-tooltip-id="dark-mode-button-tooltip"
          data-tooltip-content={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
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
      <Tooltip
        id="rate-button-tooltip"
        place="bottom"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="help-button-tooltip"
        place="bottom"
        className="uwshuffle-tooltip"
      />
      <Tooltip
        id="dark-mode-button-tooltip"
        place="bottom"
        className="uwshuffle-tooltip"
      />
    </div>
  );
};

export default ActionBar;
