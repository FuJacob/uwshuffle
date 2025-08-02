import type { Course } from "../types";

const BASE_URL = "https://uwshuffle.com";

export const generateQuickLink = (courses: Course[]) => {
  const encodedSchedule = encodeURIComponent(JSON.stringify(courses));
  const encoded = btoa(encodedSchedule);
  const urlSafe = encoded
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${BASE_URL}/?schedule=${urlSafe}`;
};
