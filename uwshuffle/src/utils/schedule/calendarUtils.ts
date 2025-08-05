import moment from "moment";
import type { Course, ParsedScheduleEvent } from "../../types";
import { pastelColors } from "../../constants/courseColors";

/**
 * Generates a consistent color for a given name using pastel colors
 */
export function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % pastelColors.length;
  return pastelColors[idx];
}

/**
 * Function to darken a hex color
 */
export function darkenColor(hex: string, amount: number = 20): string {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Darken by reducing each RGB component
  const newR = Math.max(0, r - amount);
  const newG = Math.max(0, g - amount);
  const newB = Math.max(0, b - amount);

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Converts a course to calendar events
 */
export function convertCourseToEvents(
  course: Course,
  isPreview = false,
  sourceId = "main",
  color?: string
): ParsedScheduleEvent[] {
  const courseEvents: ParsedScheduleEvent[] = [];

  // Get current week's Monday
  const startOfWeek = moment().startOf("week").add(1, "day"); // Monday

  course.days.forEach((day: string) => {
    const dayMap: { [key: string]: number } = {
      Mo: 0,
      Tu: 1,
      We: 2,
      Th: 3,
      Fr: 4,
      // Also support single-letter format from Quest scraper
      M: 0,
      W: 2,
      F: 4,
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
    const endTime = eventDate.clone().hour(endHour).minute(endMinute).toDate();

    courseEvents.push({
      id: `${sourceId}-${course.course}-${day}-${course.start}-${
        isPreview ? "preview" : "regular"
      }`,
      title: `${course.course}${
        course.location ? `\n• ${course.location}` : ""
      }${course.instructor ? `\n• ${course.instructor}` : ""}`,
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
}

/**
 * Checks if two events conflict (overlap in time)
 */
export function eventsConflict(
  event1: ParsedScheduleEvent,
  event2: ParsedScheduleEvent
): boolean {
  return event1.start < event2.end && event1.end > event2.start;
}

/**
 * Generates event styles for calendar display
 */
export function getEventStyle(event: ParsedScheduleEvent) {
  let backgroundColor = "var(--color-primary)";
  let borderColor = "var(--color-primary-dark)";

  // Use friend's color if available
  if (event.resource?.color) {
    backgroundColor = event.resource.color;
    // Create darker version for border if it's a hex color
    if (event.resource.color.startsWith("#")) {
      borderColor = darkenColor(event.resource.color, 30);
    } else {
      borderColor = event.resource.color;
    }
  }

  if (event.isPreview) {
    if (event.resource?.hasConflict) {
      backgroundColor = "var(--color-error)";
      borderColor = "var(--color-error-hover)"; // Use darker error color for border
    } else {
      backgroundColor = "var(--color-success)";
      borderColor = "var(--color-success-hover)"; // Use darker success color for border
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
}
