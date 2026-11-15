import { useCallback, useRef, useState } from "react";
import { describeError, fetchUserBundle } from "../services/githubAPI";

const IDLE = {
  status: "idle", // idle | loading | success | error
  profile: null,
  repos: [],
  events: [],
  eventsError: false,
  error: ""
};

/** Loads one developer (profile + repositories + activity). */
export function useGithubUser() {
  const [state, setState] = useState(IDLE);
  const latestRequest = useRef(0);

  const load = useCallback(async (username) => {
    const name = String(username || "").trim();
    const requestId = ++latestRequest.current;

    if (!name) {
      setState({ ...IDLE, status: "error", error: "Please enter a GitHub username." });
      return;
    }

    setState({ ...IDLE, status: "loading" });

    try {
      const bundle = await fetchUserBundle(name);

      // Ignore the result if the user already searched for someone else.
      if (requestId !== latestRequest.current) return;

      setState({ ...IDLE, ...bundle, status: "success" });
    } catch (error) {
      if (requestId !== latestRequest.current) return;

      console.error("GitHub API error:", error);
      setState({ ...IDLE, status: "error", error: describeError(error, name) });
    }
  }, []);

  return { ...state, load };
}
