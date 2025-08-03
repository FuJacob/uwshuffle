import { decompressFromEncodedURIComponent } from "lz-string";
import { supabase } from "../clients/supabase";

export const readQuickLink = async (url: string) => {
  let id: string | null = null;
  
  try {
    // Handle full URL with domain
    if (url.includes('://')) {
      const urlObj = new URL(url);
      id = urlObj.searchParams.get("schedule");
    } else {
      // Handle query string only or just the parameter value
      if (url.includes('?')) {
        const params = new URLSearchParams(url.split('?')[1]);
        id = params.get("schedule");
      } else if (url.includes('=')) {
        // Handle key=value format
        const params = new URLSearchParams(url);
        id = params.get("schedule");
      } else {
        // Assume it's just the schedule ID
        id = url.trim();
      }
    }
  } catch (error) {
    console.error('Error parsing quick link:', error);
    return null;
  }
  
  if (!id) {
    return null;
  }
  const { data, error } = await supabase
    .from("shared_schedules")
    .select("schedule, user_name")
    .eq("id", id)
    .single();
  if (error) {
    return null;
  }
  const json = decompressFromEncodedURIComponent(data.schedule);
  if (!json) {
    return null;
  } else {
    return {
      courses: JSON.parse(json),
      userName: data.user_name || null
    };
  }
};
