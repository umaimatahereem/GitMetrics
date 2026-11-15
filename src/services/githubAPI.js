import axios from "axios";

/**
 * GitHub REST API service.
 *
 * - Optional token: set VITE_GITHUB_TOKEN in a local .env file to raise the
 *   rate limit from 60 to 5,000 requests per hour (see README).
 * - Results are cached in memory for the session, so revisiting a profile or
 *   switching tabs never costs extra API requests.
 */

const token = import.meta.env.VITE_GITHUB_TOKEN;

const api = axios.create({
  baseURL: "https://api.github.com",
  timeout: 15000,
  headers: {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
});

/* ---------------- tiny promise cache ---------------- */

const cache = new Map();

function cached(key, producer) {
  if (cache.has(key)) return cache.get(key);

  const promise = producer().catch((error) => {
    cache.delete(key); // never cache failures
    throw error;
  });

  cache.set(key, promise);
  return promise;
}

const clean = (username) => String(username).trim();
const cacheKey = (type, username) => `${type}:${clean(username).toLowerCase()}`;

/* ---------------- endpoints ---------------- */

export function getUserProfile(username) {
  return cached(cacheKey("profile", username), async () => {
    const { data } = await api.get(`/users/${encodeURIComponent(clean(username))}`);
    return data;
  });
}

/** All public repositories the user owns (paginated, up to 500). */
export function getUserRepos(username) {
  return cached(cacheKey("repos", username), async () => {
    const all = [];

    for (let page = 1; page <= 5; page += 1) {
      const { data } = await api.get(
        `/users/${encodeURIComponent(clean(username))}/repos`,
        { params: { per_page: 100, page, sort: "updated", type: "owner" } }
      );

      all.push(...data);
      if (data.length < 100) break;
    }

    return all;
  });
}

/** Recent public events (GitHub keeps ~90 days / 300 events). */
export function getUserEvents(username) {
  return cached(cacheKey("events", username), async () => {
    const all = [];

    for (let page = 1; page <= 3; page += 1) {
      try {
        const { data } = await api.get(
          `/users/${encodeURIComponent(clean(username))}/events/public`,
          { params: { per_page: 100, page } }
        );

        all.push(...data);
        if (data.length < 100) break;
      } catch (error) {
        if (page === 1) throw error; // later pages are a bonus
        break;
      }
    }

    return all;
  });
}

/**
 * Everything the dashboard needs for one developer.
 * Profile and repositories are required; activity is optional, so a failure
 * there only disables the Activity tab instead of the whole dashboard.
 */
export async function fetchUserBundle(username) {
  const [profile, repos, eventsResult] = await Promise.all([
    getUserProfile(username),
    getUserRepos(username),
    getUserEvents(username).then(
      (events) => ({ ok: true, events }),
      () => ({ ok: false, events: [] })
    )
  ]);

  return {
    profile,
    repos,
    events: eventsResult.events,
    eventsError: !eventsResult.ok
  };
}

/** Rate-limit status. This endpoint does not count against the limit. */
export async function getRateLimit() {
  const { data } = await api.get("/rate_limit");
  const core = data.resources.core;

  return {
    limit: core.limit,
    remaining: core.remaining,
    reset: core.reset * 1000,
    authenticated: Boolean(token)
  };
}

/* ---------------- friendly errors ---------------- */

export function describeError(error, username = "") {
  const status = error?.response?.status;

  if (status === 404) {
    return `No GitHub user named "${username}" was found. Check the spelling and try again.`;
  }

  if (status === 403 || status === 429) {
    const remaining = error.response?.headers?.["x-ratelimit-remaining"];
    const reset = error.response?.headers?.["x-ratelimit-reset"];

    if (remaining === "0" && reset) {
      const time = new Date(Number(reset) * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      return `GitHub's hourly rate limit was reached. It resets around ${time}. Adding a token (see the README) raises the limit to 5,000 per hour.`;
    }

    return "GitHub refused the request (rate limit or access). Please try again in a little while.";
  }

  if (error?.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }

  if (!error?.response) {
    return "Can't reach GitHub right now. Check your internet connection and try again.";
  }

  return "Something went wrong while talking to GitHub. Please try again.";
}
