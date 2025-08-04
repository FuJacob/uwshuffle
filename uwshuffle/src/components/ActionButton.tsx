import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  showSuccess?: boolean;
  successIcon?: React.ReactNode;
  showError?: boolean;
  errorIcon?: React.ReactNode;
  showLoading?: boolean;
  loadingIcon?: React.ReactNode;
  tooltipId?: string;
  tooltipContent?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  className = "",
  icon,
  children,
  showSuccess = false,
  successIcon,
  showError = false,
  errorIcon,
  showLoading = false,
  loadingIcon,
  tooltipId,
  tooltipContent,
}) => {
  return (
    <button
      onClick={onClick}
      className={className}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      data-tooltip-id={disabled ? tooltipId : undefined}
      data-tooltip-content={disabled ? tooltipContent : undefined}
    >
      {showError && errorIcon ? (
        <span className="schedule-upload-icon-button">{errorIcon}</span>
      ) : showSuccess && successIcon ? (
        <span className="schedule-upload-icon-button">{successIcon}</span>
      ) : showLoading && loadingIcon ? (
        <span className="schedule-upload-icon-button">{loadingIcon}</span>
      ) : (
        <span className="schedule-upload-icon-button">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default ActionButton;