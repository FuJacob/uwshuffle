import { useEffect, useMemo, useState } from "react";
import { fetchProfInfoFromUwFlow } from "../utils/fetchProfInfoFromUwFlow";
import type { Course, ProfInfo } from "../types";

export const useGetProfInfoFromUwFlow = (
  course: Course | null
): ProfInfo | null => {
  const fetchedProfs = useMemo(
    () => new Map<ProfInfo["name"], ProfInfo | null>(),
    []
  );
  const [profInfo, setProfInfo] = useState<ProfInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!course) return;
    const instructor = course?.instructor;
    if (isLoading) return;
    if (!instructor) return;
    if (fetchedProfs.has(instructor)) {
      setProfInfo(fetchedProfs.get(instructor) ?? null);
      return;
    }

    setIsLoading(true);
    fetchProfInfoFromUwFlow(instructor)
      .then((response) => {
        fetchedProfs.set(instructor, response);
        setProfInfo(response ?? null);
      })
      .catch((error) => {
        console.error("Failed to fetch prof info:", error);
        setProfInfo(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [course, fetchedProfs, isLoading]);
  return profInfo;
};
