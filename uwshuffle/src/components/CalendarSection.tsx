import React, { useState } from "react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  FiChevronDown,
  FiChevronUp,
  FiUsers,
  FiEye,
  FiEyeOff,
  FiHelpCircle,
} from "react-icons/fi";
import type { Course, FriendSchedule } from "../types";
import CalendarView from "./CalendarView";
import { Tooltip } from "react-tooltip";

interface CalendarSectionProps {
  courses: Course[];
  previewCourse: Course | null;
  selectedCourseToSwap?: Course | null;
  friendSchedules: FriendSchedule[];
  setFriendSchedules: React.Dispatch<React.SetStateAction<FriendSchedule[]>>;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  courses,
  previewCourse,
  selectedCourseToSwap,
  friendSchedules,
  setFriendSchedules,
}) => {
  const [isCalendarCollapsed, setIsCalendarCollapsed] =
    useState<boolean>(false);

  const handleToggleFriendSchedule = (name: string) => {
    setFriendSchedules((prev: FriendSchedule[]) =>
      prev.map((f: FriendSchedule) =>
        f.name === name ? { ...f, visible: !f.visible } : f
      )
    );
  };

  return (
    <div className="uwshuffle-calendar-section">
      {/* Schedule Card */}
      <div className="uwshuffle-calendar-card">
        <div className="uwshuffle-calendar-header">
          <div className="uwshuffle-calendar-header-top">
            <div className="uwshuffle-calendar-title">
              <div className="uwshuffle-calendar-title-content">
                <span className="uwshuffle-calendar-title-text">
                  Schedule
                  <FiHelpCircle
                    className="uwshuffle-help-icon"
                    data-tooltip-id="calendar-tooltip"
                    data-tooltip-content="View your current schedule and any friend schedules you've added. Toggle friend schedules on/off and export to Google Calendar."
                  />
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
              className="uwshuffle-collapse-button"
            >
              {isCalendarCollapsed ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
          {!isCalendarCollapsed && (
            <>
              <div className="uwshuffle-schedule-title-group">
                {/* Friend Schedule Tags */}
                <div className="uwshuffle-friends-container">
                  <FiUsers className="uwshuffle-friends-icon" />
                  <span className="uwshuffle-friends-label">
                    Friends' Schedules
                  </span>
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
            </>
          )}
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
