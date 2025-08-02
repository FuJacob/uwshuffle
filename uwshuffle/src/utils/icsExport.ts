import type { Course } from "../types";
import moment from "moment";

// University of Waterloo academic calendar dates - dynamically extracted from Quest
// No default dates - must be extracted from Quest before export is enabled
let TERM_START_DATE: moment.Moment | null = null;
let TERM_END_DATE: moment.Moment | null = null;
let TERM_DATES_VALID = false;

interface ICSEvent {
  summary: string;
  dtstart: string;
  dtend: string;
  rrule: string;
  description?: string;
  location?: string;
  uid: string;
}

/**
 * Converts courses to ICS format events
 */
function coursesToICSEvents(courses: Course[]): ICSEvent[] {
  const events: ICSEvent[] = [];

  courses.forEach((course, courseIndex) => {
    course.days.forEach((day, dayIndex) => {
      // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
      const dayMap: { [key: string]: number } = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      };

      const dayNumber = dayMap[day];
      if (dayNumber === undefined) return;

      // Find the first occurrence of this day on or after term start
      if (!TERM_START_DATE) {
        throw new Error("Term start date not available");
      }
      const firstOccurrence = TERM_START_DATE.clone();
      const daysToAdd = (dayNumber - firstOccurrence.day() + 7) % 7;
      firstOccurrence.add(daysToAdd, "days");

      // Parse start and end times
      const [startHour, startMinute] = course.start.split(":").map(Number);
      const [endHour, endMinute] = course.end.split(":").map(Number);

      // Create start and end datetime for the first occurrence
      const eventStart = firstOccurrence
        .clone()
        .hour(startHour)
        .minute(startMinute)
        .second(0);
      const eventEnd = firstOccurrence
        .clone()
        .hour(endHour)
        .minute(endMinute)
        .second(0);

      // Format for ICS (UTC time)
      const dtstart = eventStart.utc().format("YYYYMMDD[T]HHmmss[Z]");
      const dtend = eventEnd.utc().format("YYYYMMDD[T]HHmmss[Z]");

      // Create recurrence rule (weekly until term end)
      if (!TERM_END_DATE) {
        throw new Error("Term end date not available");
      }
      const until = TERM_END_DATE.clone().utc().format("YYYYMMDD[T]HHmmss[Z]");
      const rrule = `FREQ=WEEKLY;UNTIL=${until}`;

      // Create event summary and description
      const summary = `${course.course}${course.section ? ` (${course.section})` : ""}`;
      const description = [
        `Course: ${course.course}`,
        course.section ? `Section: ${course.section}` : "",
        course.instructor ? `Instructor: ${course.instructor}` : "",
        `Time: ${course.start} - ${course.end}`,
        course.location ? `Location: ${course.location}` : "",
      ]
        .filter(Boolean)
        .join("\\n");

      // Generate unique ID
      const uid = `${course.course}-${course.section || "no-section"}-${day}-${courseIndex}-${dayIndex}@uwshuffle.ca`;

      events.push({
        summary,
        dtstart,
        dtend,
        rrule,
        description,
        location: course.location || "",
        uid,
      });
    });
  });

  return events;
}

/**
 * Generates ICS file content from events
 */
function generateICSContent(events: ICSEvent[], calendarName: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UWShuffle//Schedule Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
    `X-WR-CALDESC:University of Waterloo schedule exported from UWShuffle`,
    "X-WR-TIMEZONE:America/Toronto",
  ];

  events.forEach((event) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTART:${event.dtstart}`,
      `DTEND:${event.dtend}`,
      `RRULE:${event.rrule}`,
      `SUMMARY:${event.summary}`,
      event.description ? `DESCRIPTION:${event.description}` : "",
      event.location ? `LOCATION:${event.location}` : "",
      `DTSTAMP:${moment().utc().format("YYYYMMDD[T]HHmmss[Z]")}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");

  return lines.filter(Boolean).join("\\r\\n");
}

/**
 * Triggers download of ICS file in browser
 */
function downloadICSFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Exports current schedule as ICS file
 */
export function exportCurrentSchedule(courses: Course[]): void {
  if (courses.length === 0) {
    alert("No courses to export. Please upload your schedule first.");
    return;
  }

  if (!areTermDatesValid()) {
    alert("Term dates not available. Please browse Quest course search results first to enable calendar export.");
    return;
  }

  const events = coursesToICSEvents(courses);
  const content = generateICSContent(events, "UW Current Schedule");
  const filename = `uw-schedule-current-${moment().format("YYYY-MM-DD")}.ics`;
  
  downloadICSFile(content, filename);
}

/**
 * Exports schedule with swapped course as ICS file
 */
export function exportScheduleWithSwap(
  courses: Course[],
  previewCourse: Course
): void {
  if (courses.length === 0) {
    alert("No courses to export. Please upload your schedule first.");
    return;
  }

  if (!previewCourse) {
    alert("No preview course selected. Please select a course to swap first.");
    return;
  }

  if (!areTermDatesValid()) {
    alert("Term dates not available. Please browse Quest course search results first to enable calendar export.");
    return;
  }

  // Create a new schedule with the preview course added
  const swappedSchedule = [...courses, previewCourse];
  
  const events = coursesToICSEvents(swappedSchedule);
  const content = generateICSContent(
    events,
    `UW Schedule with ${previewCourse.course}`
  );
  const filename = `uw-schedule-with-${previewCourse.course.replace(/\\s+/g, "-")}-${moment().format("YYYY-MM-DD")}.ics`;
  
  downloadICSFile(content, filename);
}

/**
 * Update term dates extracted from Quest Meeting Dates
 */
export function updateTermDates(startDate: string, endDate: string): void {
  console.log(`uwshuffle: Updating term dates - Start: ${startDate}, End: ${endDate}`);
  TERM_START_DATE = moment(startDate);
  TERM_END_DATE = moment(endDate);
  TERM_DATES_VALID = true;
}

/**
 * Check if valid term dates have been extracted from Quest
 */
export function areTermDatesValid(): boolean {
  return TERM_DATES_VALID && TERM_START_DATE !== null && TERM_END_DATE !== null;
}