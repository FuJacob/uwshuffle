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
    let backgroundColor = "#3174ad";
    let borderColor = "#3174ad";

    if (event.isPreview) {
      if (event.resource?.hasConflict) {
        backgroundColor = "#dc3545";
        borderColor = "#dc3545";
      } else {
        backgroundColor = "#28a745";
        borderColor = "#28a745";
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: "white",
        fontSize: "10px",
        border: "none",
        borderRadius: "2px",
      },
    };
  };

  // Custom toolbar to show only week view
  const CustomToolbar = ({ label }: { label: string }) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "16px",
          padding: "8px",
          backgroundColor: "white",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        {label}
      </div>
    );
  };

  return (
    <div style={{ height: "100%", minHeight: "400px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", fontSize: "11px" }}
        view={"work_week" as View}
        views={["work_week"]}
        defaultView={"work_week" as View}
        toolbar={true}
        components={{
          toolbar: CustomToolbar,
        }}
        min={moment().hour(8).minute(0).toDate()}
        max={moment().hour(22).minute(0).toDate()}
        step={30}
        timeslots={2}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={() => ({
          style: {
            backgroundColor: "#f8f9fa",
          },
        })}
        formats={{
          timeGutterFormat: "h:mm A",
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${moment(start).format("h:mm")} – ${moment(end).format("h:mm A")}`,
        }}
      />

      {/* Legend */}
      <div
        style={{
          marginTop: "12px",
          padding: "8px",
          backgroundColor: "white",
          color: "#052049",
          borderRadius: "4px",
          fontSize: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#3174ad",
                borderRadius: "2px",
              }}
            ></div>
            <span>Current</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#28a745",
                borderRadius: "2px",
              }}
            ></div>
            <span>No Conflict</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#dc3545",
                borderRadius: "2px",
              }}
            ></div>
            <span>Conflict</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
