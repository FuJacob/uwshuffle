import { useEffect, useState } from "react";
import { fetchProfInfoFromUwFlow } from "../utils/fetchProfInfoFromUwFlow";
import type { Course, ProfInfo } from "../types";

export const useGetProfInfoFromUwFlow = (
  course: Course | null
): ProfInfo | null => {
  const [profInfo, setProfInfo] = useState<ProfInfo | null>(null);
  useEffect(() => {
    if (!course || !course.instructor) return;

    fetchProfInfoFromUwFlow(course.instructor).then((response) =>
      setProfInfo(response?.data?.prof?.[0] ?? null)
    );
  }, [course]);
  return profInfo;
};
