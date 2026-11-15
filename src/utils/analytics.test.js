import { describe, expect, it } from "vitest";
import {
  activityFromEvents,
  buildComparisonRows,
  compareLanguages,
  filterAndSortRepos,
  groupLanguages,
  languageBreakdown,
  recentRepos,
  repoLanguages,
  reposByYear,
  scoreComparison,
  summarizeRepos,
  topRepos
} from "./analytics";

const repo = (overrides = {}) => ({
  id: Math.random(),
  name: "repo",
  description: "",
  language: "JavaScript",
  stargazers_count: 0,
  forks_count: 0,
  open_issues_count: 0,
  fork: false,
  archived: false,
  size: 10,
  topics: [],
  created_at: "2022-05-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  pushed_at: "2023-01-01T00:00:00Z",
  ...overrides
});

const REPOS = [
  repo({ id: 1, name: "alpha", language: "JavaScript", stargazers_count: 50, forks_count: 5, created_at: "2020-03-01T00:00:00Z", pushed_at: "2024-01-10T00:00:00Z" }),
  repo({ id: 2, name: "beta-tool", language: "Python", stargazers_count: 10, forks_count: 1, description: "A handy CLI", created_at: "2022-03-01T00:00:00Z", pushed_at: "2024-03-10T00:00:00Z" }),
  repo({ id: 3, name: "gamma", language: "Python", stargazers_count: 5, fork: true, topics: ["machine-learning"], created_at: "2022-06-01T00:00:00Z", pushed_at: "2023-03-10T00:00:00Z" }),
  repo({ id: 4, name: "delta", language: null, stargazers_count: 0, archived: true, created_at: "2021-06-01T00:00:00Z", pushed_at: "2022-03-10T00:00:00Z" })
];

describe("repository summary", () => {
  it("counts languages and sorts by popularity", () => {
    const result = languageBreakdown(REPOS);

    expect(result.map((l) => l.name)).toEqual(["Python", "JavaScript"]);
    expect(result[0].value).toBe(2);
    expect(result[0].percent).toBeCloseTo(66.7, 1);
  });

  it("merges small languages into Other", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ name: `L${i}`, value: 10 - i, percent: 0 }));
    const grouped = groupLanguages(many, 7);

    expect(grouped).toHaveLength(8);
    expect(grouped[7].name).toBe("Other");
    expect(grouped[7].value).toBe(3 + 2 + 1);
  });

  it("totals stars, forks and repo types", () => {
    const summary = summarizeRepos(REPOS);

    expect(summary.totalRepos).toBe(4);
    expect(summary.totalStars).toBe(65);
    expect(summary.totalForks).toBe(6);
    expect(summary.forkRepos).toBe(1);
    expect(summary.sourceRepos).toBe(3);
    expect(summary.archivedRepos).toBe(1);
    expect(summary.avgStars).toBeCloseTo(16.25, 2);
    expect(summary.topLanguage).toBe("Python");
  });

  it("handles an empty list", () => {
    const summary = summarizeRepos([]);

    expect(summary.totalRepos).toBe(0);
    expect(summary.avgStars).toBe(0);
    expect(summary.topLanguage).toBe("None");
  });

  it("ranks top and recent repositories", () => {
    expect(topRepos(REPOS, 2).map((r) => r.name)).toEqual(["alpha", "beta-tool"]);
    expect(recentRepos(REPOS, 1)[0].name).toBe("beta-tool");
  });

  it("builds a zero-filled repos-per-year series", () => {
    const years = reposByYear(REPOS);

    expect(years.map((y) => y.year)).toEqual(["2020", "2021", "2022"]);
    expect(years.map((y) => y.count)).toEqual([1, 1, 2]);
  });
});

describe("search, filter and sort", () => {
  it("searches name, description and topics", () => {
    expect(filterAndSortRepos(REPOS, { query: "tool" })).toHaveLength(1);
    expect(filterAndSortRepos(REPOS, { query: "handy" })).toHaveLength(1);
    expect(filterAndSortRepos(REPOS, { query: "machine" })).toHaveLength(1);
    expect(filterAndSortRepos(REPOS, { query: "nothing-matches" })).toHaveLength(0);
  });

  it("filters by language, including Unknown", () => {
    expect(filterAndSortRepos(REPOS, { language: "Python" })).toHaveLength(2);
    expect(filterAndSortRepos(REPOS, { language: "Unknown" })).toHaveLength(1);
    expect(repoLanguages(REPOS)).toEqual(["JavaScript", "Python", "Unknown"]);
  });

  it("filters by repository type", () => {
    expect(filterAndSortRepos(REPOS, { type: "sources" })).toHaveLength(3);
    expect(filterAndSortRepos(REPOS, { type: "forks" })).toHaveLength(1);
    expect(filterAndSortRepos(REPOS, { type: "archived" })).toHaveLength(1);
  });

  it("sorts by different fields", () => {
    expect(filterAndSortRepos(REPOS, { sort: "stars" })[0].name).toBe("alpha");
    expect(filterAndSortRepos(REPOS, { sort: "name" })[0].name).toBe("alpha");
    expect(filterAndSortRepos(REPOS, { sort: "created" })[0].name).toBe("gamma");
    expect(filterAndSortRepos(REPOS, { sort: "updated" })[0].name).toBe("beta-tool");
  });

  it("does not mutate the original array", () => {
    const copy = [...REPOS];
    filterAndSortRepos(REPOS, { sort: "name" });
    expect(REPOS).toEqual(copy);
  });
});

describe("developer activity", () => {
  const now = new Date(2026, 10, 14, 18, 0, 0); // 14 Nov 2026, local time
  const at = (daysAgo, hour = 10) => new Date(2026, 10, 14 - daysAgo, hour, 0, 0).toISOString();

  const events = [
    { type: "PushEvent", created_at: at(0), repo: { name: "me/app" }, payload: {} },
    { type: "PushEvent", created_at: at(1), repo: { name: "me/app" }, payload: {} },
    { type: "PullRequestEvent", created_at: at(2), repo: { name: "me/lib" }, payload: {} },
    { type: "WatchEvent", created_at: at(40), repo: { name: "x/y" }, payload: {} }
  ];

  it("counts events, pushes and active days", () => {
    const activity = activityFromEvents(events, { now });

    expect(activity.totalEvents).toBe(4);
    expect(activity.pushes).toBe(2);
    expect(activity.activeDays).toBe(4);
  });

  it("builds a zero-filled 30 day series ending today", () => {
    const activity = activityFromEvents(events, { now });

    expect(activity.daily).toHaveLength(30);
    expect(activity.daily[29].count).toBe(1);
    expect(activity.daily[28].count).toBe(1);
    expect(activity.daily[20].count).toBe(0);
  });

  it("calculates current and longest streaks", () => {
    const activity = activityFromEvents(events, { now });

    expect(activity.streak.current).toBe(3);
    expect(activity.streak.longest).toBe(3);
  });

  it("keeps the streak alive when today has no activity yet", () => {
    const activity = activityFromEvents(events.slice(1, 3), { now });

    expect(activity.streak.current).toBe(2);
  });

  it("groups events by type, weekday, hour and repository", () => {
    const activity = activityFromEvents(events, { now });

    expect(activity.byType[0]).toEqual({ name: "Pushes", value: 2 });
    expect(activity.byWeekday).toHaveLength(7);
    expect(activity.byHour).toHaveLength(24);
    expect(activity.byHour[10].count).toBe(4);
    expect(activity.peakHour).toBe("10:00");
    expect(activity.topRepos[0]).toEqual({ name: "me/app", count: 2 });
  });

  it("copes with no events and invalid dates", () => {
    const empty = activityFromEvents([], { now });

    expect(empty.totalEvents).toBe(0);
    expect(empty.busiestDay).toBeNull();
    expect(empty.streak.current).toBe(0);

    const broken = activityFromEvents([{ type: "PushEvent", created_at: "nope" }], { now });
    expect(broken.totalEvents).toBe(0);
  });
});

describe("comparing developers", () => {
  const side = (followers, publicRepos, stars, pushes, created = "2018-01-01T00:00:00Z") => ({
    profile: { followers, public_repos: publicRepos, created_at: created },
    summary: { totalStars: stars, totalForks: 1, avgStars: stars / 2, languageCount: 3 },
    activity: { pushes }
  });

  it("picks a winner per metric and tallies the score", () => {
    const rows = buildComparisonRows(side(100, 10, 500, 20), side(50, 30, 500, 5));
    const byKey = Object.fromEntries(rows.map((row) => [row.key, row.winner]));

    expect(byKey.followers).toBe("a");
    expect(byKey.repos).toBe("b");
    expect(byKey.stars).toBe("tie");
    expect(byKey.pushes).toBe("a");

    const score = scoreComparison(rows);
    expect(score.a + score.b + score.ties).toBe(rows.length);
    expect(score.a).toBeGreaterThan(score.b);
  });

  it("finds shared and unique languages", () => {
    const result = compareLanguages(
      [repo({ language: "Go" }), repo({ language: "Rust" })],
      [repo({ language: "Rust" }), repo({ language: "Ruby" })]
    );

    expect(result.shared).toEqual(["Rust"]);
    expect(result.onlyA).toEqual(["Go"]);
    expect(result.onlyB).toEqual(["Ruby"]);
  });
});
