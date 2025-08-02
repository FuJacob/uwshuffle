import { useState } from "react";
import { FiHelpCircle, FiEye, FiEyeOff, FiUsers } from "react-icons/fi";
import CalendarView from "./CalendarView";
import ScheduleControls from "./ScheduleControls";
import type { Course } from "../types";
import type { FriendSchedule } from "../types";
import { Tooltip } from "react-tooltip";

interface CalendarSectionProps {
  courses: Course[];
  previewCourse: Course | null;
  termDatesAvailable: boolean;
  onExportCurrentSchedule: () => void;
  onExportWithSwap: () => void;
  selectedCourseToSwap?: Course | null;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  courses,
  previewCourse,
  termDatesAvailable,
  onExportCurrentSchedule,
  onExportWithSwap,
  selectedCourseToSwap,
}) => {
  const [friendSchedules, setFriendSchedules] = useState<FriendSchedule[]>([]);
  // const [isCalendarCollapsed, setIsCalendarCollapsed] =
  //   useState<boolean>(false);

  const handleToggleFriendSchedule = (name: string) => {
    setFriendSchedules((prev) =>
      prev.map((f) => (f.name === name ? { ...f, visible: !f.visible } : f))
    );
  };

  return (
    <div className="uwshuffle-calendar-section">
      {/* Schedule Controls Card */}
      <ScheduleControls
        courses={courses}
        previewCourse={previewCourse}
        termDatesAvailable={termDatesAvailable}
        onExportCurrentSchedule={onExportCurrentSchedule}
        onExportWithSwap={onExportWithSwap}
        onFriendSchedulesChange={setFriendSchedules}
        friendSchedules={friendSchedules}
      />

      {/* Schedule Card */}
      <div className="uwshuffle-calendar-card">
        <div className="uwshuffle-calendar-header">
          <div className="uwshuffle-calendar-header-top">
            <div className="uwshuffle-calendar-title">
              <div className="uwshuffle-calendar-title-content">
                <div className="uwshuffle-schedule-title-group">
                  <span>Schedule</span>
                  <FiHelpCircle
                    className="uwshuffle-help-icon"
                    data-tooltip-id="schedule-tooltip"
                    data-tooltip-content="View your weekly schedule with all courses. Preview courses appear with a different color to show potential conflicts."
                  />
                </div>
                {/* Friend Schedule Tags */}
                <div className="uwshuffle-friends-container">
                  <FiUsers className="uwshuffle-friends-icon" />
                  <span className="uwshuffle-friends-label">Friends</span>
                  {friendSchedules.map((friendSchedule) => (
                    <button
                      className={`uwshuffle-tag-button ${
                        !friendSchedule.visible
                          ? "uwshuffle-tag-button-hidden"
                          : ""
                      }`}
                      style={{
                        backgroundColor: friendSchedule.color,
                      }}
                      key={friendSchedule.name}
                      onClick={() =>
                        handleToggleFriendSchedule(friendSchedule.name)
                      }
                    >
                      {friendSchedule.visible ? (
                        <FiEye className="uwshuffle-tag-icon" />
                      ) : (
                        <FiEyeOff className="uwshuffle-tag-icon" />
                      )}
                      {friendSchedule.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* <button
              onClick={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
              className="uwshuffle-collapse-button"
            >
              {isCalendarCollapsed ? <FiPlus /> : <FiMinus />}
            </button> */}
          </div>
        </div>
        <div className="uwshuffle-calendar-content">
          <CalendarView
            courses={courses}
            previewCourse={previewCourse}
            friendSchedules={friendSchedules}
            selectedCourseToSwap={selectedCourseToSwap}
          />
        </div>
      </div>
      <Tooltip
        id="schedule-tooltip"
        place="top"
        className="uwshuffle-tooltip"
      />
    </div>
  );
};

export default CalendarSection;
