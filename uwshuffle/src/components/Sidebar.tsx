import React, { useState, useEffect } from "react";
import ScheduleUpload from "./ScheduleUpload";
import InstructionsModal from "./InstructionsModal";
import CalendarSection from "./CalendarSection";
import PreviewInsights from "./PreviewInsights";
import ActionBar from "./ActionBar";
import type { Course } from "../types";
import logo from "../assets/logo.svg";
import { FiBook, FiRefreshCcw, FiCheckCircle } from "react-icons/fi";
import {
  exportCurrentSchedule,
  exportScheduleWithSwap,
  areTermDatesValid,
} from "../utils/icsExport";
import { useGetProfInfoFromUwFlow } from "../hooks/useGetProfInfoFromUwFlow";

// Progress Bar Component
interface CurrentStepProgressBarProps {
  courses: Course[];
  previewCourse: Course | null;
}

const CurrentStepProgressBar: React.FC<CurrentStepProgressBarProps> = ({
  courses,
  previewCourse,
}) => {
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
                <div
                  className={`uwshuffle-step-arrow ${
                    index <= currentStep ? "uwshuffle-step-arrow-active" : ""
                  }`}
                >
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Step Only - Narrow screens */}
      <div className="uwshuffle-step-labels uwshuffle-step-labels-current">
        <div className="uwshuffle-step-label uwshuffle-step-label-active">
          {React.createElement(steps[currentStep].icon, {
            className: "uwshuffle-step-icon",
          })}
          <span className="uwshuffle-step-text">{steps[currentStep].text}</span>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [currentInstructionStep, setCurrentInstructionStep] =
    useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [termDatesAvailable, setTermDatesAvailable] = useState<boolean>(false);
  const [scheduleUploadError, setScheduleUploadError] = useState<string | null>(
    null
  );
  const [selectedCourseToSwap, setSelectedCourseToSwap] =
    useState<Course | null>(null);
  const profInfo = useGetProfInfoFromUwFlow(previewCourse);

  // Debug preview course changes
  useEffect(() => {
    console.log("uwshuffle: Preview course changed:", previewCourse);
  }, [previewCourse]);

  // Check Chrome storage for minimized state on component mount
  useEffect(() => {
    if (!window.chrome || !chrome.storage || !chrome.storage.local) {
      return;
    }
    chrome.storage.local.get(["uw_shuffle_minimized"], (result) => {
      if (result.uw_shuffle_minimized !== undefined) {
        setIsMinimized(result.uw_shuffle_minimized);
      }
    });
  }, []);

  useEffect(() => {
    if (!window.chrome || !chrome.storage || !chrome.storage.local) {
      return;
    }
    chrome.storage.local
      .get("uwshuffle_onboarding_completed")
      .then((result) => {
        if (result.uwshuffle_onboarding_completed == true) {
          setIsModalOpen(false);
        } else {
          setIsModalOpen(true);
        }
      });
  }, []);

  useEffect(() => {
    if (scheduleUploadError) {
      // Show error notification
      alert(`Error uploading schedule: ${scheduleUploadError}`);
      // Reset error after showing
      setScheduleUploadError(null);
    }
  }, [scheduleUploadError]);

  // Monitor term dates availability
  useEffect(() => {
    const checkTermDates = () => {
      setTermDatesAvailable(areTermDatesValid());
    };

    // Check immediately and then every 2 seconds
    checkTermDates();
    const interval = setInterval(checkTermDates, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleNextInstruction = () => {
    setCurrentInstructionStep((prev) => (prev + 1) % 3);
  };

  // Listen for messages from content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "uwshuffle_action") {
        switch (event.data.action) {
          case "add_preview_course":
            console.log("uwshuffle: Received preview course:", event.data.data);
            setPreviewCourse(event.data.data);
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleCoursesUploaded = (newCourses: Course[]) => {
    setCourses(newCourses);
  };

  const handleClearSchedule = () => {
    setCourses([]);
    setSelectedCourseToSwap(null);
  };

  const handleCourseSelectedToSwap = (course: Course | null) => {
    setSelectedCourseToSwap(course);
  };

  const handleKofiClick = () => {
    // Open Ko-fi page
    window.open("https://ko-fi.com/jacobfu", "_blank", "noopener,noreferrer");
  };

  const handleRateClick = () => {
    // Open Chrome Web Store page
    window.open(
      "https://chrome.google.com/webstore/detail/uwshuffle/jgcgjieedkddicejglgncnfepggcepma",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCloseSidebar = () => {
    setIsMinimized(true);
    // Save to Chrome storage
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ uw_shuffle_minimized: true });
    }
    // Notify parent window about sidebar state change
    window.parent.postMessage(
      {
        type: "uwshuffle_sidebar_state",
        isMinimized: true,
      },
      "*"
    );
  };

  const handleExpandSidebar = () => {
    setIsMinimized(false);
    // Save to Chrome storage
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ uw_shuffle_minimized: false });
    }
    // Notify parent window about sidebar state change
    window.parent.postMessage(
      {
        type: "uwshuffle_sidebar_state",
        isMinimized: false,
      },
      "*"
    );
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ uwshuffle_onboarding_completed: true });
    }
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Apply theme to document
    if (newDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const handleExportCurrentSchedule = () => {
    exportCurrentSchedule(courses);
  };

  const handleExportWithSwap = () => {
    if (previewCourse) {
      exportScheduleWithSwap(courses, previewCourse);
    }
  };

  // addPreviewCourse is handled via message listener
  useEffect(() => {
    console.log(profInfo);
  }, [profInfo]);
  return (
    <>
      <div
        className={`uwshuffle-sidebar ${
          isMinimized ? "uwshuffle-sidebar-minimized" : ""
        }`}
      >
        {!isMinimized && (
          <>
            {/* Main Content Area */}
            <div className="uwshuffle-main-content">
              <ActionBar
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onRateClick={handleRateClick}
                onKofiClick={handleKofiClick}
                onHelpClick={handleOpenModal}
                onCloseSidebar={handleCloseSidebar}
              />

              {/* Progress Bar - moved from CurrentStep */}
              <div className="uwshuffle-current-step-section">
                <CurrentStepProgressBar
                  courses={courses}
                  previewCourse={previewCourse}
                />
              </div>

              <PreviewInsights
                previewCourse={previewCourse}
                profInfo={profInfo}
              />

              {/* Upload Section */}
              <div className="uwshuffle-upload-section">
                <ScheduleUpload
                  setScheduleUploadError={setScheduleUploadError}
                  onCoursesUploaded={handleCoursesUploaded}
                  onClearSchedule={handleClearSchedule}
                  courses={courses}
                  onCourseSelectedToSwap={handleCourseSelectedToSwap}
                  selectedCourseToSwap={selectedCourseToSwap}
                />
              </div>

              <CalendarSection
                courses={courses}
                previewCourse={previewCourse}
                termDatesAvailable={termDatesAvailable}
                onExportCurrentSchedule={handleExportCurrentSchedule}
                onExportWithSwap={handleExportWithSwap}
                selectedCourseToSwap={selectedCourseToSwap}
              />

              {/* Footer with modern styling */}
            </div>
          </>
        )}
      </div>

      {/* Expand button - outside sidebar so it's always visible when minimized */}
      {isMinimized && (
        <button
          onClick={handleExpandSidebar}
          className="uwshuffle-expand-button"
        >
          <img src={logo} alt="UWShuffle" className="uwshuffle-expand-logo" />
        </button>
      )}

      <InstructionsModal
        isOpen={isModalOpen}
        currentInstructionStep={currentInstructionStep}
        onClose={handleCloseModal}
        onNextInstruction={handleNextInstruction}
      />
    </>
  );
};

export default Sidebar;
