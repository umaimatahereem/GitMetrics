/* Small, dependency-free helpers for formatting and input handling. */

const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1
});

const fullFormatter = new Intl.NumberFormat("en");

export const formatCompact = (n) => compactFormatter.format(Number(n) || 0);
export const formatFull = (n) => fullFormatter.format(Number(n) || 0);

export function formatDecimal(n, digits = 1) {
  return (Number(n) || 0).toFixed(digits);
}

/** "3 days ago", "2 months ago", "today" ... */
export function timeAgo(dateString, now = new Date()) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "unknown";

  const days = Math.floor((now - date) / 86400000);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;

  const years = Math.floor(days / 365);
  return years <= 1 ? "1 year ago" : `${years} years ago`;
}

export function formatMonthYear(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", { month: "short", year: "numeric" });
}

export function accountAgeYears(createdAt, now = new Date()) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 0;
  return Math.max(0, (now - created) / (365.25 * 86400000));
}

/* ---------------- username handling ---------------- */

const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export const isValidUsername = (name) => USERNAME_PATTERN.test(name);

/** Accepts "octocat", "@octocat" or "https://github.com/octocat". */
export function parseUsername(raw = "") {
  let value = String(raw).trim();

  const urlMatch = value.match(/github\.com\/([^/?#\s]+)/i);
  if (urlMatch) value = urlMatch[1];

  return value.replace(/^@/, "").trim();
}

/** Returns { name, error } - error is "" when the input is usable. */
export function resolveUsername(raw) {
  const name = parseUsername(raw);

  if (!name) {
    return { name: "", error: "Please enter a GitHub username." };
  }

  if (!isValidUsername(name)) {
    return {
      name,
      error:
        "That doesn't look like a valid GitHub username. Use letters, numbers and single hyphens only."
    };
  }

  return { name, error: "" };
}

/* ---------------- CSV export ---------------- */

function csvCell(value) {
  let text = String(value ?? "");

  // Prevent spreadsheet formula injection from repository descriptions.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;

  return `"${text.replace(/"/g, '""')}"`;
}

export function reposToCsv(repos) {
  const header = [
    "name",
    "description",
    "language",
    "stars",
    "forks",
    "open_issues",
    "is_fork",
    "archived",
    "created_at",
    "last_push",
    "url"
  ];

  const rows = repos.map((repo) =>
    [
      repo.name,
      repo.description,
      repo.language,
      repo.stargazers_count,
      repo.forks_count,
      repo.open_issues_count,
      repo.fork,
      repo.archived,
      repo.created_at,
      repo.pushed_at || repo.updated_at,
      repo.html_url
    ]
      .map(csvCell)
      .join(",")
  );

  return [header.join(","), ...rows].join("\n");
}

export function downloadTextFile(filename, text, type = "text/csv") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
