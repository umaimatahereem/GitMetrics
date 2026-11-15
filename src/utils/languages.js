/* Colors for common languages (matching GitHub), with a calm fallback palette. */

const KNOWN = {
  JavaScript: "#e6c33a",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#6a4fa3",
  SCSS: "#c6538c",
  "C++": "#f34b7d",
  C: "#6e6e6e",
  "C#": "#178600",
  Go: "#00add8",
  Rust: "#dea584",
  Ruby: "#a8202a",
  PHP: "#4f5d95",
  Shell: "#5fae4b",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  Dart: "#00b4ab",
  Vue: "#41b883",
  "Jupyter Notebook": "#da5b0b",
  Unknown: "#8a98b0",
  Other: "#a3afc4"
};

const FALLBACK = [
  "#4a7fc1",
  "#3fb0ac",
  "#e0a44a",
  "#d9667a",
  "#8a7bd6",
  "#5fae6b",
  "#c2796b",
  "#6b8fa8"
];

export function languageColor(name, index = 0) {
  return KNOWN[name] || FALLBACK[index % FALLBACK.length];
}

/** Shared chart palette (readable in light and dark themes). */
export const CHART_COLORS = {
  primary: "#4a7fc1",
  secondary: "#3fb0ac",
  warm: "#e0a44a",
  rose: "#d9667a"
};
