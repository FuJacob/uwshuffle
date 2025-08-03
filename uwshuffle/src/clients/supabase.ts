import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oubjrxsjptxlxicgypad.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91YmpyeHNqcHR4bHhpY2d5cGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDg2MDUsImV4cCI6MjA2OTcyNDYwNX0.P135u3nWUy_HVdmUPZxpg4yK-4-FkQBxuDDloq4_0SA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
