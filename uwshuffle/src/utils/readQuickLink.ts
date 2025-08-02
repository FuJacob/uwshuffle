import { decompressFromEncodedURIComponent } from "lz-string";
import { supabase } from "../clients/supabase";

export const readQuickLink = async (url: string) => {
  const params = new URLSearchParams(url);
  const id = params.get("schedule");
  if (!id) {
    return null;
  }
  const { data, error } = await supabase
    .from("shared_schedules")
    .select("schedule")
    .eq("id", id)
    .single();
  if (error) {
    return null;
  }
  const json = decompressFromEncodedURIComponent(data.schedule);
  if (!json) {
    return null;
  } else {
    return JSON.parse(json);
  }
};
