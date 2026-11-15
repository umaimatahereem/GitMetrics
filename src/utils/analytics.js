/* Pure data-processing functions. No React, no network: easy to test. */

import { accountAgeYears } from "./format";

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const sum = (list, pick) => list.reduce((total, item) => total + (pick(item) || 0), 0);

/* =========================================
   REPOSITORY SUMMARY
========================================= */

export function languageBreakdown(repos = []) {
  const counts = {};

  repos.forEach((repo) => {
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
  });

  const total = sum(Object.values(counts), (n) => n);

  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      value,
      percent: total ? Math.round((value / total) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

/** Keep the biggest `max` languages and merge the rest into "Other". */
export function groupLanguages(list, max = 7) {
  if (list.length <= max) return list;

  const head = list.slice(0, max);
  const rest = list.slice(max);
  const value = sum(rest, (item) => item.value);
  const total = sum(list, (item) => item.value);

  return [
    ...head,
    { name: "Other", value, percent: total ? Math.round((value / total) * 1000) / 10 : 0 }
  ];
}

export function summarizeRepos(repos = []) {
  const totalStars = sum(repos, (r) => r.stargazers_count);
  const totalForks = sum(repos, (r) => r.forks_count);
  const languages = languageBreakdown(repos);
  const forkRepos = repos.filter((r) => r.fork).length;

  return {
    totalRepos: repos.length,
    sourceRepos: repos.length - forkRepos,
    forkRepos,
    archivedRepos: repos.filter((r) => r.archived).length,
    totalStars,
    totalForks,
    totalIssues: sum(repos, (r) => r.open_issues_count),
    avgStars: repos.length ? totalStars / repos.length : 0,
    languageCount: languages.length,
    topLanguage: languages[0]?.name || "None"
  };
}

export function topRepos(repos = [], count = 5) {
  return [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count || b.forks_count - a.forks_count)
    .slice(0, count);
}

const lastTouched = (repo) => new Date(repo.pushed_at || repo.updated_at);

export function recentRepos(repos = [], count = 5) {
  return [...repos].sort((a, b) => lastTouched(b) - lastTouched(a)).slice(0, count);
}

/** Number of repositories created per year, oldest first (gaps filled with 0). */
export function reposByYear(repos = []) {
  const counts = {};

  repos.forEach((repo) => {
    const year = new Date(repo.created_at).getFullYear();
    if (!Number.isNaN(year)) counts[year] = (counts[year] || 0) + 1;
  });

  const years = Object.keys(counts).map(Number);
  if (!years.length) return [];

  const result = [];
  for (let year = Math.min(...years); year <= Math.max(...years); year += 1) {
    result.push({ year: String(year), count: counts[year] || 0 });
  }

  return result;
}

/* =========================================
   SEARCH, FILTER & SORT
========================================= */

export const SORT_OPTIONS = [
  { value: "stars", label: "Most stars" },
  { value: "forks", label: "Most forks" },
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Newest created" },
  { value: "name", label: "Name (A-Z)" },
  { value: "size", label: "Largest size" }
];

export const TYPE_OPTIONS = [
  { value: "all", label: "All repositories" },
  { value: "sources", label: "Original only" },
  { value: "forks", label: "Forks only" },
  { value: "archived", label: "Archived" }
];

const comparators = {
  stars: (a, b) => b.stargazers_count - a.stargazers_count,
  forks: (a, b) => b.forks_count - a.forks_count,
  updated: (a, b) => lastTouched(b) - lastTouched(a),
  created: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  name: (a, b) => a.name.localeCompare(b.name),
  size: (a, b) => b.size - a.size
};

export function repoLanguages(repos = []) {
  const names = new Set(repos.map((repo) => repo.language || "Unknown"));
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function filterAndSortRepos(
  repos = [],
  { query = "", language = "all", type = "all", sort = "stars" } = {}
) {
  const needle = query.trim().toLowerCase();

  const filtered = repos.filter((repo) => {
    if (type === "sources" && repo.fork) return false;
    if (type === "forks" && !repo.fork) return false;
    if (type === "archived" && !repo.archived) return false;

    if (language !== "all" && (repo.language || "Unknown") !== language) return false;

    if (needle) {
      const haystack = [repo.name, repo.description, ...(repo.topics || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(needle)) return false;
    }

    return true;
  });

  return filtered.sort(comparators[sort] || comparators.stars);
}

/* =========================================
   DEVELOPER ACTIVITY (from public events)
========================================= */

const EVENT_LABELS = {
  PushEvent: "Pushes",
  PullRequestEvent: "Pull requests",
  PullRequestReviewEvent: "Reviews",
  PullRequestReviewCommentEvent: "Reviews",
  IssuesEvent: "Issues",
  IssueCommentEvent: "Comments",
  CommitCommentEvent: "Comments",
  CreateEvent: "Created",
  DeleteEvent: "Deleted",
  WatchEvent: "Stars given",
  ForkEvent: "Forks",
  ReleaseEvent: "Releases"
};

const pad = (n) => String(n).padStart(2, "0");

export const dayKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function streaks(flags) {
  // flags[0] is the oldest day, the last item is today.
  let longest = 0;
  let run = 0;

  flags.forEach((active) => {
    run = active ? run + 1 : 0;
    longest = Math.max(longest, run);
  });

  // The current streak may still be "alive" if today has no activity yet.
  let index = flags.length - 1;
  if (!flags[index]) index -= 1;

  let current = 0;
  while (index >= 0 && flags[index]) {
    current += 1;
    index -= 1;
  }

  return { current, longest };
}

export function activityFromEvents(events = [], { days = 30, now = new Date() } = {}) {
  const byType = {};
  const byWeekday = Array(7).fill(0);
  const byHour = Array(24).fill(0);
  const repoCounts = {};
  const dailyMap = {};
  // GitHub no longer includes commit counts in public push events (since
  // Oct 2025), so we count pushes, which are still reported reliably.
  let pushes = 0;
  let total = 0;

  events.forEach((event) => {
    const date = new Date(event.created_at);
    if (Number.isNaN(date.getTime())) return;

    total += 1;

    const label = EVENT_LABELS[event.type] || "Other";
    byType[label] = (byType[label] || 0) + 1;

    if (event.type === "PushEvent") pushes += 1;

    byWeekday[date.getDay()] += 1;
    byHour[date.getHours()] += 1;

    const key = dayKey(date);
    dailyMap[key] = (dailyMap[key] || 0) + 1;

    if (event.repo?.name) {
      repoCounts[event.repo.name] = (repoCounts[event.repo.name] || 0) + 1;
    }
  });

  // Daily series for the chart (oldest -> today), zero-filled.
  const daily = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = dayKey(date);

    daily.push({
      date: key,
      label: `${date.getDate()} ${MONTHS[date.getMonth()]}`,
      count: dailyMap[key] || 0
    });
  }

  // Streaks look back 90 days (the span GitHub keeps).
  const flags = [];
  for (let i = 89; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    flags.push(Boolean(dailyMap[dayKey(date)]));
  }

  const weekdayData = DAY_NAMES.map((day, index) => ({ day, count: byWeekday[index] }));
  const hourData = byHour.map((count, hour) => ({ hour, label: `${pad(hour)}:00`, count }));

  const busiestDay = total ? [...weekdayData].sort((a, b) => b.count - a.count)[0].day : null;
  const peakHour = total ? [...hourData].sort((a, b) => b.count - a.count)[0].label : null;

  return {
    totalEvents: total,
    pushes,
    activeDays: Object.keys(dailyMap).length,
    streak: streaks(flags),
    daily,
    byWeekday: weekdayData,
    byHour: hourData,
    byType: Object.entries(byType)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    topRepos: Object.entries(repoCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    busiestDay,
    peakHour
  };
}

/* =========================================
   COMPARING TWO DEVELOPERS
========================================= */

export function buildComparisonRows(a, b) {
  const metric = (key, label, pickA, pickB, format = "int") => {
    const valueA = pickA;
    const valueB = pickB;

    return {
      key,
      label,
      a: valueA,
      b: valueB,
      format,
      winner: valueA > valueB ? "a" : valueB > valueA ? "b" : "tie"
    };
  };

  return [
    metric("followers", "Followers", a.profile.followers, b.profile.followers),
    metric("repos", "Public repositories", a.profile.public_repos, b.profile.public_repos),
    metric("stars", "Total stars", a.summary.totalStars, b.summary.totalStars),
    metric("forks", "Total forks", a.summary.totalForks, b.summary.totalForks),
    metric("avg", "Avg stars per repo", a.summary.avgStars, b.summary.avgStars, "decimal"),
    metric("languages", "Languages used", a.summary.languageCount, b.summary.languageCount),
    metric(
      "age",
      "Account age (years)",
      accountAgeYears(a.profile.created_at),
      accountAgeYears(b.profile.created_at),
      "decimal"
    ),
    metric("pushes", "Recent pushes", a.activity.pushes, b.activity.pushes)
  ];
}

export function scoreComparison(rows) {
  return rows.reduce(
    (score, row) => {
      if (row.winner === "a") score.a += 1;
      else if (row.winner === "b") score.b += 1;
      else score.ties += 1;
      return score;
    },
    { a: 0, b: 0, ties: 0 }
  );
}

export function compareLanguages(reposA = [], reposB = []) {
  const namesA = new Set(languageBreakdown(reposA).map((l) => l.name));
  const namesB = new Set(languageBreakdown(reposB).map((l) => l.name));

  return {
    shared: [...namesA].filter((name) => namesB.has(name)).sort(),
    onlyA: [...namesA].filter((name) => !namesB.has(name)).sort(),
    onlyB: [...namesB].filter((name) => !namesA.has(name)).sort()
  };
}
