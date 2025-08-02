import type { Course } from "../types";
import { courseCodes } from "../constants/courseCodes";

export const parseScheduleText = (text: string): Course[] => {
  const lines = text
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");
  const courses: Course[] = [];

  let currentCourse: Partial<Course> | null = null;
  let expectingLocation = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    const COURSE_REGEX = new RegExp(
      `^(${Array.from(courseCodes).join("|")})\\s*\\d{3}[A-Z]?`,
      "i"
    );

    const courseMatch = trimmedLine.match(COURSE_REGEX);
    if (courseMatch) {
      if (
        currentCourse &&
        currentCourse.course &&
        currentCourse.days &&
        currentCourse.start &&
        currentCourse.end
      ) {
        courses.push(currentCourse as Course);
      }

      currentCourse = {
        course: courseMatch[0].replace(/\s+/g, " ").trim(),
      };
      expectingLocation = false;

      const timeMatch = trimmedLine.match(
        /([MTWRF]+)\s+(\d{1,2}:\d{2}[AP]M)\s*-\s*(\d{1,2}:\d{2}[AP]M)(?:\s+(.+))?/
      );
      if (timeMatch) {
        const [, dayString, startTime, endTime, location] = timeMatch;
        currentCourse.days = parseDayString(dayString);
        currentCourse.start = convertTo24Hour(startTime);
        currentCourse.end = convertTo24Hour(endTime);
        currentCourse.location = location?.trim();
        expectingLocation = false;
      }
    } else if (currentCourse) {
      const timeMatch = trimmedLine.match(
        /([MTWRF]+)\s+(\d{1,2}:\d{2}[AP]M)\s*-\s*(\d{1,2}:\d{2}[AP]M)(?:\s+(.+))?/
      );

      if (timeMatch) {
        if (
          currentCourse.course &&
          currentCourse.days &&
          currentCourse.start &&
          currentCourse.end
        ) {
          courses.push(currentCourse as Course);
        }

        const [, dayString, startTime, endTime, location] = timeMatch;
        currentCourse = {
          course: currentCourse.course,
          days: parseDayString(dayString),
          start: convertTo24Hour(startTime),
          end: convertTo24Hour(endTime),
          location: location?.trim(),
        };

        if (!location || location.trim() === "") {
          expectingLocation = true;
        } else {
          expectingLocation = false;
        }
      } else if (
        expectingLocation &&
        currentCourse.course &&
        currentCourse.days &&
        currentCourse.start &&
        currentCourse.end
      ) {
        currentCourse.location = trimmedLine;
        expectingLocation = false;
      } else if (
        currentCourse.course &&
        !currentCourse.days &&
        !currentCourse.start &&
        !currentCourse.end
      ) {
        const timeOnlyMatch = trimmedLine.match(
          /([MTWRF]+)\s+(\d{1,2}:\d{2}[AP]M)\s*-\s*(\d{1,2}:\d{2}[AP]M)/
        );
        if (timeOnlyMatch) {
          const [, dayString, startTime, endTime] = timeOnlyMatch;
          currentCourse.days = parseDayString(dayString);
          currentCourse.start = convertTo24Hour(startTime);
          currentCourse.end = convertTo24Hour(endTime);
          expectingLocation = true;
        }
      }
    }
  }

  if (
    currentCourse &&
    currentCourse.course &&
    currentCourse.days &&
    currentCourse.start &&
    currentCourse.end
  ) {
    courses.push(currentCourse as Course);
  }

  return courses;
};

export const parseDayString = (dayString: string): string[] => {
  const dayMap: { [key: string]: string } = {
    M: "Mo",
    T: "Tu",
    W: "We",
    R: "Th",
    F: "Fr",
  };

  return dayString
    .split("")
    .map((day) => dayMap[day])
    .filter(Boolean);
};

export const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(/([AP]M)/);
  let [hours] = time.split(":");
  const [, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = (parseInt(hours, 10) + 12).toString();
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
};