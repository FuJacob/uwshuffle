import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";
// import Joyride from "react-joyride";

// Components
import ActionBar from "./ActionBar";
import CalendarSection from "./CalendarSection";
import PreviewInsights from "./PreviewInsights";
import ScheduleControls from "./ScheduleControls";
import ScheduleUpload from "./ScheduleUpload";

// Hooks
import { useGetProfInfoFromUwFlow } from "../hooks/useGetProfInfoFromUwFlow";
import { useSidebarState } from "../hooks/useSidebarState";
// import { useOnboardingTour } from "../hooks/useOnboardingTour";

// Types
import type { Course, FriendSchedule } from "../types";

// Utils
import {
  exportCurrentSchedule,
  exportScheduleWithSwap,
} from "../utils/schedule";

// Constants
// import { steps } from "../constants/steps";

const Sidebar: React.FC = () => {
  // Core state
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [termDatesAvailable, setTermDatesAvailable] = useState<boolean>(false);
  const [termDates, setTermDates] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  // Load selected course from localStorage
  const [selectedCourseToSwap, setSelectedCourseToSwap] = useState<
    Course | null | "None"
  >(() => {
    const saved = localStorage.getItem("uwshuffle-selected-course-to-swap");
    if (saved && saved !== "null") {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch {
        // Invalid localStorage data, using default
        localStorage.removeItem("uwshuffle-selected-course-to-swap");
      }
    }
    return null;
  });
  const [friendSchedules, setFriendSchedules] = useState<FriendSchedule[]>([]);
  const [isExpandLogoSpinning, setIsExpandLogoSpinning] =
    useState<boolean>(false);

  // Custom hooks
  const { isMinimized, handleCloseSidebar, handleExpandSidebar } =
    useSidebarState();
  // const { run, handleJoyrideCallback, startTour } = useOnboardingTour(isMinimized);
  const profInfo = useGetProfInfoFromUwFlow(previewCourse);

  // Handle help click - redirect to help.uwshuffle.com
  const handleHelpClick = useCallback(() => {
    window.open("https://uwshuffle.com/help", "_blank", "noopener,noreferrer");
  }, []);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Listen for messages from content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "uwshuffle_action" && isMountedRef.current) {
        switch (event.data.action) {
          case "add_preview_course":
            setPreviewCourse(event.data.data);
            break;
          case "term_dates_extracted":
            setTermDates(event.data.data);
            setTermDatesAvailable(true);
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleCoursesUploaded = useCallback((newCourses: Course[]) => {
    setCourses(newCourses);
  }, []);

  const handleClearSchedule = useCallback(() => {
    setCourses([]);
    setSelectedCourseToSwap(null);
    // Clear from localStorage as well (this will be saved by the useEffect)
  }, []);

  const handleCourseSelectedToSwap = useCallback(
    (course: Course | null | "None") => {
      setSelectedCourseToSwap(course);
    },
    []
  );

  // Save selected course to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "uwshuffle-selected-course-to-swap",
      JSON.stringify(selectedCourseToSwap)
    );
  }, [selectedCourseToSwap]);

  const handleKofiClick = useCallback(() => {
    // Open Ko-fi page
    window.open("https://uwshuffle.com/", "_blank", "noopener,noreferrer");
  }, []);

  const handleRateClick = useCallback(() => {
    // Open Chrome Web Store page
    window.open(
      "https://chrome.google.com/webstore/detail/uwshuffle/jgcgjieedkddicejglgncnfepggcepma",
      "_blank",
      "noopener,noreferrer"
    );
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Apply theme to document
    if (newDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isDarkMode]);

  const handleExpandSidebarWithSpin = useCallback(() => {
    setIsExpandLogoSpinning(true);
    setTimeout(() => setIsExpandLogoSpinning(false), 1800);
    handleExpandSidebar();
  }, [handleExpandSidebar]);

  // Spin expand logo when minimized and on first load if minimized
  useEffect(() => {
    if (isMinimized) {
      setIsExpandLogoSpinning(true);
      setTimeout(() => setIsExpandLogoSpinning(false), 1800);
    }
  }, [isMinimized]);

  const handleExportCurrentSchedule = useCallback(() => {
    if (termDates) {
      const result = exportCurrentSchedule(
        courses,
        termDates.startDate,
        termDates.endDate
      );
      // Result handling is managed by the ScheduleControls component through button disabled states
      return result;
    }
    return { success: false, error: "Term dates not available" };
  }, [termDates, courses]);

  const handleExportWithSwap = useCallback(() => {
    if (previewCourse && termDates) {
      const result = exportScheduleWithSwap(
        courses,
        previewCourse,
        termDates.startDate,
        termDates.endDate
      );
      // Result handling is managed by the ScheduleControls component through button disabled states
      return result;
    }
    return {
      success: false,
      error: "Preview course or term dates not available",
    };
  }, [previewCourse, termDates, courses]);

  // Sidebar section configuration
  const defaultSections = [
    "controls",
    "preview",
    "schedule-controls",
    "calendar",
  ];

  // Drag-and-drop sidebar section order state
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("uwshuffle-sidebar-order");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === defaultSections.length) {
          return parsed;
        }
      } catch {
        // Invalid localStorage data, using default order
        localStorage.removeItem("uwshuffle-sidebar-order");
      }
    }
    return defaultSections;
  });

  // Save sidebar order to localStorage
  useEffect(() => {
    localStorage.setItem("uwshuffle-sidebar-order", JSON.stringify(sections));
  }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
        delay: 100,
        tolerance: 5,
      },
    })
  );

  function renderSection(id: string) {
    switch (id) {
      case "preview":
        return (
          <PreviewInsights previewCourse={previewCourse} profInfo={profInfo} />
        );
      case "action-bar":
        return (
          <ActionBar
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onRateClick={handleRateClick}
            onKofiClick={handleKofiClick}
            onHelpClick={handleHelpClick}
            onCloseSidebar={handleCloseSidebar}
          />
        );
      case "controls":
        return (
          <div className="uwshuffle-upload-section">
            <ScheduleUpload
              onCoursesUploaded={handleCoursesUploaded}
              onClearSchedule={handleClearSchedule}
              courses={courses}
              onCourseSelectedToSwap={handleCourseSelectedToSwap}
              selectedCourseToSwap={selectedCourseToSwap}
            />
          </div>
        );
      case "schedule-controls":
        return (
          <ScheduleControls
            courses={courses}
            previewCourse={previewCourse}
            termDatesAvailable={termDatesAvailable}
            onExportCurrentSchedule={handleExportCurrentSchedule}
            onExportWithSwap={handleExportWithSwap}
            onFriendSchedulesChange={setFriendSchedules}
            friendSchedules={friendSchedules}
          />
        );
      case "calendar":
        return (
          <CalendarSection
            courses={courses}
            previewCourse={previewCourse}
            selectedCourseToSwap={selectedCourseToSwap}
            friendSchedules={friendSchedules}
            setFriendSchedules={setFriendSchedules}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      {/* Tour functionality disabled - help now links to help.uwshuffle.com */}
      {/* {!isMinimized && (
        <Joyride
          steps={steps}
          run={run}
          continuous={true}
          showSkipButton={true}
          showProgress={true}
          callback={handleJoyrideCallback}
          disableOverlayClose={true}
          disableScrolling={true}
          styles={{
          options: {
            zIndex: 10000,
            primaryColor: "var(--color-primary)",
            backgroundColor: "var(--color-surface)",
            textColor: "var(--color-text-primary)",
            arrowColor: "var(--color-surface)",
            overlayColor: "rgba(0, 0, 0, 0.5)",
          },
          overlay: {
            zIndex: 10000,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          tooltip: {
            zIndex: 10001,
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-lg)",
            color: "var(--color-text-primary)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-family)",
            padding: "var(--space-4)",
            maxWidth: "400px",
          },
          tooltipContainer: {
            textAlign: "left",
            lineHeight: "1.5",
          },
          tooltipTitle: {
            color: "var(--color-text-primary)",
            fontSize: "var(--font-size-base)",
            fontWeight: "600",
            marginBottom: "var(--space-2)",
          },
          tooltipContent: {
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-sm)",
            lineHeight: "1.5",
            padding: "var(--space-2) 0",
          },
          buttonNext: {
            backgroundColor: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "600",
            padding: "var(--space-2) var(--space-3)",
            cursor: "pointer",
            transition: "var(--transition-fast)",
            fontFamily: "var(--font-family)",
          },
          buttonBack: {
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "600",
            padding: "var(--space-2) var(--space-3)",
            cursor: "pointer",
            transition: "var(--transition-fast)",
            fontFamily: "var(--font-family)",
          },
          buttonSkip: {
            backgroundColor: "transparent",
            color: "var(--color-text-tertiary)",
            border: "none",
            fontSize: "var(--font-size-sm)",
            fontWeight: "500",
            padding: "var(--space-2) var(--space-3)",
            cursor: "pointer",
            transition: "var(--transition-fast)",
            fontFamily: "var(--font-family)",
          },
          buttonClose: {
            backgroundColor: "transparent",
            color: "var(--color-text-tertiary)",
            border: "none",
            fontSize: "var(--font-size-sm)",
            padding: "var(--space-2)",
            cursor: "pointer",
            transition: "var(--transition-fast)",
            position: "absolute",
            right: "var(--space-2)",
            top: "var(--space-2)",
          },
          beacon: {
            zIndex: 10002,
            backgroundColor: "var(--color-primary)",
            border: "2px solid var(--color-primary-dark)",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
          },
          beaconInner: {
            backgroundColor: "var(--color-primary)",
          },
          beaconOuter: {
            backgroundColor: "var(--color-primary-alpha)",
            border: "2px solid var(--color-primary)",
          },
        }}
        />
      )} */}
      <div
        className={`uwshuffle-sidebar ${
          isMinimized ? "uwshuffle-sidebar-minimized" : ""
        }`}
      >
        {!isMinimized && (
          <>
            {/* Main Content Area */}
            <div className="uwshuffle-main-content">
              {/* Action Bar - Always at top, not draggable */}
              <div
                className="uwshuffle-section-container"
                data-animation-delay="0"
              >
                {renderSection("action-bar")}
              </div>

              {/* Draggable Sections */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (!isMountedRef.current) return;
                  if (active.id !== over?.id) {
                    const oldIndex = sections.indexOf(active.id as string);
                    const newIndex = sections.indexOf(over?.id as string);
                    if (oldIndex !== -1 && newIndex !== -1) {
                      setSections(arrayMove(sections, oldIndex, newIndex));
                    }
                  }
                }}
              >
                <SortableContext
                  items={sections}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((id: string, index: number) => (
                    <SortableSection
                      key={id}
                      id={id}
                      animationDelay={(index + 1) * 0.1}
                    >
                      {renderSection(id)}
                    </SortableSection>
                  ))}
                </SortableContext>
              </DndContext>
              {/* Footer with modern styling */}
            </div>
          </>
        )}
      </div>

      {/* Expand button - outside sidebar so it's always visible when minimized */}
      {isMinimized && (
        <button
          onClick={handleExpandSidebarWithSpin}
          className="uwshuffle-expand-button"
        >
          <img
            src="/logo.svg"
            alt="UWShuffle"
            className={`uwshuffle-expand-logo ${
              isExpandLogoSpinning ? "spinning" : ""
            }`}
          />
        </button>
      )}
    </>
  );
};

export default Sidebar;

// SortableSection wrapper for drag-and-drop
function SortableSection({
  id,
  children,
  animationDelay,
}: {
  id: string;
  children: React.ReactNode;
  animationDelay: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="uwshuffle-section-container"
      data-animation-delay={animationDelay}
    >
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          padding: "2px 0",
          borderTop: "1px solid transparent",
          borderBottom: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderTop = "1px solid var(--color-border)";
          e.currentTarget.style.borderBottom = "1px solid var(--color-border)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderTop = "1px solid transparent";
          e.currentTarget.style.borderBottom = "1px solid transparent";
        }}
      >
        {children}
      </div>
    </div>
  );
}
