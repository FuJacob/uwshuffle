import React, { useState, useEffect } from "react";
import ScheduleUpload from "./ScheduleUpload";
import InstructionsModal from "./InstructionsModal";
import CalendarSection from "./CalendarSection";
import CurrentStep from "./CurrentStep";
import PreviewInsights from "./PreviewInsights";
import ActionBar from "./ActionBar";
import type { Course } from "../types";
import logo from "../assets/logo.svg";
import {
  exportCurrentSchedule,
  exportScheduleWithSwap,
  areTermDatesValid,
} from "../utils/icsExport";
import { useGetProfInfoFromUwFlow } from "../hooks/useGetProfInfoFromUwFlow";

const Sidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>({
    course: "STAT 230",
    days: ["Mon", "Wed", "Fri"],
    start: "11:30",
    end: "12:20",
    location: "UTD 105",
    section: "001",
    instructor: "Dr. John Smith",
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [currentInstructionStep, setCurrentInstructionStep] =
    useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [termDatesAvailable, setTermDatesAvailable] = useState<boolean>(false);
  const [scheduleUploadError, setScheduleUploadError] = useState<string | null>(
    null
  );
  const profInfo = useGetProfInfoFromUwFlow(previewCourse);

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
              <PreviewInsights
                previewCourse={previewCourse}
                profInfo={profInfo}
              />

              <CurrentStep courses={courses} previewCourse={previewCourse} />

              {/* Upload Section */}
              <div className="uwshuffle-upload-section">
                <ScheduleUpload
                  setScheduleUploadError={setScheduleUploadError}
                  onCoursesUploaded={handleCoursesUploaded}
                  onClearSchedule={handleClearSchedule}
                  courses={courses}
                />
              </div>

              <CalendarSection
                courses={courses}
                previewCourse={previewCourse}
                termDatesAvailable={termDatesAvailable}
                onExportCurrentSchedule={handleExportCurrentSchedule}
                onExportWithSwap={handleExportWithSwap}
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
