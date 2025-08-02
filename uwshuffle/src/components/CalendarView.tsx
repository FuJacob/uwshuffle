import React, { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import moment from "moment";
import type { Course, ParsedScheduleEvent, FriendSchedule } from "../types";

const localizer = momentLocalizer(moment);

// Function to darken a hex color
function darkenColor(hex: string, amount: number = 20): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  
  // Darken by reducing each RGB component
  const newR = Math.max(0, r - amount);
  const newG = Math.max(0, g - amount);
  const newB = Math.max(0, b - amount);
  
  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}


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

    const convertCourseToEvents = (course: Course, isPreview = false, sourceId = "main", color?: string) => {
      const courseEvents: ParsedScheduleEvent[] = [];

      // Get current week's Monday
      const startOfWeek = moment().startOf("week").add(1, "day"); // Monday

      course.days.forEach((day) => {
        const dayMap: { [key: string]: number } = {
          Mo: 0,
          Tu: 1,
          We: 2,
          Th: 3,
          Fr: 4,
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
          id: `${sourceId}-${course.course}-${day}-${course.start}-${
            isPreview ? "preview" : "regular"
          }`,
          title: `${course.course} • ${moment(startTime).format(
            "h:mm"
          )} - ${moment(endTime).format("h:mm A")}${
            course.location ? ` • ${course.location}` : ""
          }${course.instructor ? ` • ${course.instructor}` : ""}`,
          start: startTime,
          end: endTime,
          resource: {
            course: course.course,
            isPreview,
            hasConflict: false,
            color: color,
          },
          isPreview,
        });
      });

      return courseEvents;
    };

    // Add regular courses, but filter out selected course if preview is active
    const filteredCourses = courses.filter((course) => {
      // If preview is active and this course is selected to swap, exclude it
      if (previewCourse && selectedCourseToSwap && course.course === selectedCourseToSwap.course) {
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
            const sanitizedName = friendSchedule.name.replace(/[^a-zA-Z0-9]/g, '-');
            allEvents.push(...convertCourseToEvents(course, false, `friend-${index}-${sanitizedName}`, friendSchedule.color));
          });
        }
      });
    }

    // Add preview course
    if (previewCourse) {
      const previewEvents = convertCourseToEvents(previewCourse, true, "preview");

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
    let backgroundColor = "var(--color-primary)";
    let borderColor = "var(--color-primary-dark)";

    // Use friend's color if available
    if (event.resource?.color) {
      backgroundColor = event.resource.color;
      // Create darker version for border if it's a hex color
      if (event.resource.color.startsWith('#')) {
        borderColor = darkenColor(event.resource.color, 30);
      } else {
        borderColor = event.resource.color;
      }
      console.log('Friend event color:', event.resource.color, 'border:', borderColor, 'for event:', event.title);
    }

    if (event.isPreview) {
      if (event.resource?.hasConflict) {
        backgroundColor = "var(--color-error)";
        borderColor = "var(--color-error)";
      } else {
        backgroundColor = "var(--color-success)";
        borderColor = "var(--color-success)";
      }
    }

    return {
      style: {
        backgroundColor,
        border: `2px solid ${borderColor}`,
        color: "var(--color-surface)",
        fontSize: "11px",
        fontWeight: "600",
        borderRadius: "6px",
        boxShadow: "var(--shadow-sm)",
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
