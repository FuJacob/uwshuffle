import React, { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import moment from "moment";
import type { Course, ParsedScheduleEvent } from "../types";

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  courses: Course[];
  previewCourse?: Course | null;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  courses,
  previewCourse,
}) => {
  // Convert courses to calendar events
  const events = useMemo(() => {
    const allEvents: ParsedScheduleEvent[] = [];

    const convertCourseToEvents = (course: Course, isPreview = false) => {
      const courseEvents: ParsedScheduleEvent[] = [];

      // Get current week's Monday
      const startOfWeek = moment().startOf("week").add(1, "day"); // Monday

      course.days.forEach((day) => {
        const dayMap: { [key: string]: number } = {
          Mon: 0,
          Tue: 1,
          Wed: 2,
          Thu: 3,
          Fri: 4,
        };

        const dayOffset = dayMap[day];
        if (dayOffset === undefined) return;

        const eventDate = startOfWeek.clone().add(dayOffset, "days");

        // Parse start and end times
        const [startHour, startMinute] = course.start.split(":").map(Number);
        const [endHour, endMinute] = course.end.split(":").map(Number);

        const startTime = eventDate
          .clone()
          .hour(startHour)
          .minute(startMinute)
          .toDate();
        const endTime = eventDate
          .clone()
          .hour(endHour)
          .minute(endMinute)
          .toDate();

        courseEvents.push({
          id: `${course.course}-${day}-${course.start}-${
            isPreview ? "preview" : "regular"
          }`,
          title: `${course.course}${
            course.location ? ` (${course.location})` : ""
          }`,
          start: startTime,
          end: endTime,
          resource: {
            course: course.course,
            isPreview,
            hasConflict: false,
          },
          isPreview,
        });
      });

      return courseEvents;
    };

    // Add regular courses
    courses.forEach((course) => {
      allEvents.push(...convertCourseToEvents(course, false));
    });

    // Add preview course
    if (previewCourse) {
      const previewEvents = convertCourseToEvents(previewCourse, true);

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
  }, [courses, previewCourse]);

  // Custom event style getter
  const eventStyleGetter = (event: ParsedScheduleEvent) => {
    let backgroundColor = "#0052CC";
    let borderColor = "#0052CC";

    if (event.isPreview) {
      if (event.resource?.hasConflict) {
        backgroundColor = "#DC3545";
        borderColor = "#DC3545";
      } else {
        backgroundColor = "#28A745";
        borderColor = "#28A745";
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: "white",
        fontSize: "11px",
        fontWeight: "600",
        border: "none",
        borderRadius: "6px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
    };
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
        step={60}
        timeslots={1}
        toolbar={false}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={() => ({
          style: {
            backgroundColor: "white",
          },
        })}
        formats={{
          timeGutterFormat: "h A",
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
