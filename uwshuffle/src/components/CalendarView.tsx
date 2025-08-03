import React, { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import moment from "moment";
import type { Course, ParsedScheduleEvent, FriendSchedule } from "../types";
import { convertCourseToEvents, getEventStyle } from "../utils/calendarUtils";

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  courses: Course[];
  previewCourse?: Course | null;
  friendSchedules?: FriendSchedule[];
  selectedCourseToSwap?: Course | null;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  courses,
  previewCourse,
  friendSchedules,
  selectedCourseToSwap,
}) => {
  // Convert courses to calendar events
  const events = useMemo(() => {
    const allEvents: ParsedScheduleEvent[] = [];

    // Add regular courses, but filter out selected course if preview is active
    const filteredCourses = courses.filter((course) => {
      // If preview is active and this course is selected to swap, exclude it
      if (
        previewCourse &&
        selectedCourseToSwap &&
        course.course === selectedCourseToSwap.course
      ) {
        return false;
      }
      return true;
    });

    filteredCourses.forEach((course) => {
      allEvents.push(...convertCourseToEvents(course, false, "user"));
    });

    // add friend schedules
    if (friendSchedules) {
      friendSchedules.forEach((friendSchedule, index) => {
        if (friendSchedule.visible) {
          friendSchedule.schedule.forEach((course) => {
            const sanitizedName = friendSchedule.name.replace(
              /[^a-zA-Z0-9]/g,
              "-"
            );
            allEvents.push(
              ...convertCourseToEvents(
                course,
                false,
                `friend-${index}-${sanitizedName}`,
                friendSchedule.color
              )
            );
          });
        }
      });
    }

    // Add preview course
    if (previewCourse) {
      const previewEvents = convertCourseToEvents(
        previewCourse,
        true,
        "preview"
      );

      // Check for conflicts
      previewEvents.forEach((previewEvent) => {
        const hasConflict = allEvents.some(
          (existingEvent) =>
            !existingEvent.isPreview &&
            existingEvent.start < previewEvent.end &&
            existingEvent.end > previewEvent.start
        );

        if (previewEvent.resource) {
          previewEvent.resource.hasConflict = hasConflict;
        }
      });

      allEvents.push(...previewEvents);
    }

    return allEvents;
  }, [courses, previewCourse, friendSchedules, selectedCourseToSwap]);

  // Custom event style getter
  const eventStyleGetter = (event: ParsedScheduleEvent) => {
    return getEventStyle(event);
  };

  // Always show calendar, even when empty

  return (
    <div className="uwshuffle-calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        className="uwshuffle-calendar-wrapper"
        view={"work_week" as View}
        views={["work_week"]}
        defaultView={"work_week" as View}
        min={moment().hour(8).minute(0).toDate()}
        max={moment().hour(20).minute(0).toDate()}
        step={30}
        timeslots={1}
        toolbar={false}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={() => ({
          style: {
            backgroundColor: "var(--color-surface)",
          },
        })}
        formats={{
          timeGutterFormat: "h:mm A",
          dayFormat: "ddd",
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${moment(start).format("h:mm")} – ${moment(end).format("h:mm A")}`,
        }}
        showMultiDayTimes={false}
        scrollToTime={moment().hour(8).minute(0).toDate()}
      />
    </div>
  );
};

export default CalendarView;
