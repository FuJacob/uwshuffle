import React, { useState, useEffect } from "react";
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
import InstructionsModal from "./InstructionsModal";
import CalendarSection from "./CalendarSection";
import PreviewInsights from "./PreviewInsights";
import ActionBar from "./ActionBar";
import ScheduleControls from "./ScheduleControls";
import type { Course } from "../types";
import type { FriendSchedule } from "../types";
import logo from "../assets/logo.svg";
import Joyride from "react-joyride";

import {
  exportCurrentSchedule,
  exportScheduleWithSwap,
  areTermDatesValid,
} from "../utils/icsExport";
import { useGetProfInfoFromUwFlow } from "../hooks/useGetProfInfoFromUwFlow";
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
  const [friendSchedules, setFriendSchedules] = useState<FriendSchedule[]>([]);
  const profInfo = useGetProfInfoFromUwFlow(previewCourse);

  const [run, setRun] = useState(false);
  const steps = [
    {
      target: ".my-first-step",
      content: "This is my awesome feature!",
    },
    {
      target: ".my-other-step",
      content: "This another awesome feature!",
    },
  ];

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
  // Drag-and-drop sidebar section order state & logic
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("uwshuffle-sidebar-order");
    return saved
      ? JSON.parse(saved)
      : ["preview", "controls", "schedule_controls", "calendar"];
  });

  // Save sidebar order to localStorage
  useEffect(() => {
    localStorage.setItem("uwshuffle-sidebar-order", JSON.stringify(sections));
  }, [sections]);

  const sensors = useSensors(useSensor(PointerSensor));

  function renderSection(id: string) {
    switch (id) {
      case "preview":
        return (
          <PreviewInsights previewCourse={previewCourse} profInfo={profInfo} />
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
      case "schedule_controls":
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
            termDatesAvailable={termDatesAvailable}
            onExportCurrentSchedule={handleExportCurrentSchedule}
            onExportWithSwap={handleExportWithSwap}
            selectedCourseToSwap={selectedCourseToSwap}
          />
        );
      default:
        return null;
    }
  }

  const handleJoyrideCallback = (data: any) => {
    const { status, action } = data;
    if (status === "finished" && action === "skip") {
      setRun(false);
    }
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
              <ActionBar
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onRateClick={handleRateClick}
                onKofiClick={handleKofiClick}
                onHelpClick={handleOpenModal}
                onCloseSidebar={handleCloseSidebar}
              />
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
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      {children}
    </div>
  );
}
