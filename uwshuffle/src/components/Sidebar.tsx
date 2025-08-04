import React, { useState, useEffect, useRef } from "react";
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
import ScheduleUpload from "./ScheduleUpload";

import CalendarSection from "./CalendarSection";
import PreviewInsights from "./PreviewInsights";
import ActionBar from "./ActionBar";
import type { Course, FriendSchedule } from "../types";

import Joyride, { type CallBackProps } from "react-joyride";

import {
  exportCurrentSchedule,
  exportScheduleWithSwap,
} from "../utils/icsExport";
import { useGetProfInfoFromUwFlow } from "../hooks/useGetProfInfoFromUwFlow";
import ScheduleControls from "./ScheduleControls";
import { steps } from "../constants/steps";

const Sidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [termDatesAvailable, setTermDatesAvailable] = useState<boolean>(false);
  const [termDates, setTermDates] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [scheduleUploadError, setScheduleUploadError] = useState<string | null>(
    null
  );
  const [selectedCourseToSwap, setSelectedCourseToSwap] = useState<
    Course | null | "None"
  >(null);
  const profInfo = useGetProfInfoFromUwFlow(previewCourse);
  const [friendSchedules, setFriendSchedules] = useState<FriendSchedule[]>([]);
  const [run, setRun] = useState(false);

  // Add ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check Chrome storage for minimized state on component mount
  useEffect(() => {
    if (!window.chrome || !chrome.storage || !chrome.storage.local) {
      return;
    }
    chrome.storage.local.get(["uw_shuffle_minimized"], (result) => {
      if (isMountedRef.current && result.uw_shuffle_minimized !== undefined) {
        setIsMinimized(result.uw_shuffle_minimized);
      }
    });
  }, []);

  // Start tour when sidebar is first expanded
  useEffect(() => {
    if (!isMinimized) {
      // Start tour after a short delay to ensure components are rendered
      if (window.chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(
          ["uwshuffle_onboarding_completed"],
          (result) => {
            if (
              isMountedRef.current &&
              result.uwshuffle_onboarding_completed !== true
            ) {
              startTour();
            }
          }
        );
      }
    }
  }, [isMinimized]);

  useEffect(() => {
    if (!window.chrome || !chrome.storage || !chrome.storage.local) {
      return;
    }
    chrome.storage.local
      .get("uwshuffle_onboarding_completed")
      .then((result) => {
        if (isMountedRef.current) {
          if (result.uwshuffle_onboarding_completed == true) {
            setRun(false);
          } else {
            setRun(true);
          }
        }
      });
  }, []);

  useEffect(() => {
    if (scheduleUploadError && isMountedRef.current) {
      // Reset error after showing (no more alert needed - using visual error state)
      if (isMountedRef.current) {
        setScheduleUploadError(null);
      }
    }
  }, [scheduleUploadError]);

  // No longer need to monitor localStorage - term dates come via postMessage

  // Listen for messages from content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "uwshuffle_action" && isMountedRef.current) {
        switch (event.data.action) {
          case "add_preview_course":
            setPreviewCourse(event.data.data);
            break;
          case "term_dates_extracted":
            console.log("uwshuffle: Received term dates:", event.data.data);
            setTermDates(event.data.data);
            setTermDatesAvailable(true);
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

  const handleCourseSelectedToSwap = (course: Course | null | "None") => {
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
    if (termDates) {
      exportCurrentSchedule(courses, termDates.startDate, termDates.endDate);
    }
  };

  const handleExportWithSwap = () => {
    if (previewCourse && termDates) {
      exportScheduleWithSwap(
        courses,
        previewCourse,
        termDates.startDate,
        termDates.endDate
      );
    }
  };

  // addPreviewCourse is handled via message listener
  const defaultSections = [
    "action-bar",
    "controls",
    "preview",
    "schedule-controls",
    "calendar",
  ];
  // Drag-and-drop sidebar section order state & logic
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("uwshuffle-sidebar-order");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length === defaultSections.length) {
        return parsed;
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
            onHelpClick={startTour}
            onCloseSidebar={handleCloseSidebar}
          />
        );
      case "controls":
        return (
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

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    if (status === "finished" || action === "skip") {
      setRun(false);
      if (window.chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ uwshuffle_onboarding_completed: true });
      }
    }
  };

  const startTour = () => {
    setRun(true);
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        callback={handleJoyrideCallback}
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
      <div
        className={`uwshuffle-sidebar ${
          isMinimized ? "uwshuffle-sidebar-minimized" : ""
        }`}
      >
        {!isMinimized && (
          <>
            {/* Main Content Area */}
            <div className="uwshuffle-main-content">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (active.id !== over?.id) {
                    const oldIndex = sections.indexOf(active.id as string);
                    const newIndex = sections.indexOf(over?.id as string);
                    setSections(arrayMove(sections, oldIndex, newIndex));
                  }
                }}
              >
                <SortableContext
                  items={sections}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((id: string) => (
                    <SortableSection key={id} id={id}>
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
          onClick={handleExpandSidebar}
          className="uwshuffle-expand-button"
        >
          <img
            src="/logo.svg"
            alt="UWShuffle"
            className="uwshuffle-expand-logo"
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
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <div 
        {...attributes} 
        {...listeners} 
        style={{ 
          cursor: "grab", 
          padding: "2px 0",
          borderTop: "1px solid transparent",
          borderBottom: "1px solid transparent"
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
