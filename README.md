# GitMetrics

A GitHub analytics dashboard. Search any public GitHub user and get profile
insights, repository analytics (search / filter / sort / CSV export), developer
activity charts, and a side-by-side comparison of two developers.

Built with React, Vite, Axios, Recharts and Lucide icons.

## Install the update into your project

1. Copy the `src` folder from this zip over your project's `src` folder
   (replace files when asked). `main.jsx` is unchanged.
2. Delete nothing else. Your `package.json`, `index.html` and `vite.config.js` stay as they are.
3. Run `npm run dev`.

No new packages are needed: it only uses `react`, `axios`, `recharts` and
`lucide-react`, which you already have.

## Features

| Roadmap step | What you get |
| --- | --- |
| 9. Top & recent repositories | Top 5 by stars (with bars) and 5 most recently pushed |
| 10. Search, filter & sort | Search name/description/topics, filter by language and type (original / forks / archived), 6 sort options, grid or list view, CSV export |
| 11. Developer activity | Events over 30 days, active days, streaks, busiest weekday, peak hour, event types, most active repos |
| 12. Compare developers | Two usernames, 8 metrics, winner per row, shared and unique languages |
| 13. Responsive UI & polish | Works from phone to wide desktop, light and dark theme, loading skeletons |
| 14. Testing & error handling | Username validation, friendly errors (not found, rate limit, offline, timeout), error boundary, unit tests |

Extras: shareable links (`#/user/octocat/activity`), recent searches, and a
footer showing how many API requests you have left.

## Rate limit (important)

GitHub allows **60 requests per hour** without a token. One profile uses
roughly 3-9 requests (repositories and activity are paginated), so expect about
8-20 profile views per hour. Results are cached while the page stays open, so
switching tabs or revisiting a profile costs nothing. The footer shows what is left.

To raise the limit to 5,000 per hour:

1. Create a **fine-grained personal access token** at
   https://github.com/settings/personal-access-tokens with **no permissions**
   (public data only).
2. Copy `.env.example` to `.env` and paste the token:
   `VITE_GITHUB_TOKEN=github_pat_xxxxx`
3. Restart `npm run dev`.

**Never commit `.env`** (it is already ignored by Vite's default `.gitignore`)
and **don't deploy a build that contains your token**: anything prefixed
`VITE_` is embedded in the public JavaScript. Use the token for local use only.

## Data notes

- Only public data is available. Private repositories are never shown.
- Repositories: up to 500 of the user's own repositories are analyzed.
- Activity comes from GitHub's public events feed, which keeps about 90 days /
  300 events. GitHub no longer includes commit counts in these events, so the
  app reports **pushes**, not commits.
- "Language" is GitHub's primary language per repository, not lines of code.

## Run the tests

```bash
npm install -D vitest
```

Add to `package.json` scripts: `"test": "vitest run"`, then `npm test`.
The tests cover the analytics, filtering, activity/streak and comparison logic,
username parsing, CSV export and routing.

## Project structure

```
src/
  components/   UI pieces (Navbar, tabs, charts, cards, error states)
  pages/        Home, UserPage (dashboard), ComparePage
  hooks/        useGithubUser, useTheme, useRecentSearches, useRateLimit
  services/     githubAPI.js (Axios, pagination, caching, error messages)
  utils/        analytics (pure logic), format, router, languages (+ tests)
```
