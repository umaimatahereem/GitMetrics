/* Pure routing helpers (no React), so they can be unit tested. */

export function parseHash(hash = "") {
  const raw = hash.replace(/^#\/?/, "");
  const parts = raw
    .split("/")
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    });

  if (parts[0] === "user" && parts[1]) {
    return { name: "user", username: parts[1], tab: parts[2] || "overview" };
  }

  if (parts[0] === "compare") {
    return { name: "compare", a: parts[1] || "", b: parts[2] || "" };
  }

  return { name: "home" };
}

export const userPath = (username, tab = "") =>
  `/user/${encodeURIComponent(username)}${tab ? `/${tab}` : ""}`;

export const comparePath = (a = "", b = "") =>
  `/compare${a ? `/${encodeURIComponent(a)}` : ""}${a && b ? `/${encodeURIComponent(b)}` : ""}`;
