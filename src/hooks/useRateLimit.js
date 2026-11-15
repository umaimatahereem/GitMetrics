import { useCallback, useEffect, useState } from "react";
import { getRateLimit } from "../services/githubAPI";

/** Tracks the remaining GitHub API requests (shown in the footer). */
export function useRateLimit() {
  const [rate, setRate] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setRate(await getRateLimit());
    } catch {
      /* not critical: the footer simply hides */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rate, refresh };
}
