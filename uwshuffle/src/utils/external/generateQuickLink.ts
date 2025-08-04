import { compressToEncodedURIComponent } from "lz-string";
import type { Course } from "../../types";
import { nanoid } from "nanoid";
import { supabase } from "../../clients/supabase";

const BASE_URL = "https://uwshuffle.com";

export const generateQuickLink = async (courses: Course[], userName?: string) => {
  const id = nanoid(8);
  const compressedSchedule = compressToEncodedURIComponent(
    JSON.stringify(courses)
  );
  await supabase.from("shared_schedules").insert({
    id,
    schedule: compressedSchedule,
    user_name: userName || null,
  });

  return `${BASE_URL}/?schedule=${id}`;
};
