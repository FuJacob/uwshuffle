import { compressToEncodedURIComponent } from "lz-string";
import type { Course } from "../types";
import { nanoid } from "nanoid";
import { supabase } from "../clients/supabase";

const BASE_URL = "https://uwshuffle.com";

export const generateQuickLink = async (courses: Course[]) => {
  const id = nanoid(8);
  const compressedSchedule = compressToEncodedURIComponent(
    JSON.stringify(courses)
  );
  await supabase.from("shared_schedules").insert({
    id,
    schedule: compressedSchedule,
  });

  return `${BASE_URL}/?schedule=${id}`;
};
