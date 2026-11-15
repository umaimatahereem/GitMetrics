import { useCallback, useState } from "react";

const KEY = "gm-recent";
const MAX = 6;

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState(read);

  const add = useCallback((name) => {
    setRecent((previous) => {
      const next = [name, ...previous.filter((n) => n.toLowerCase() !== name.toLowerCase())].slice(0, MAX);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setRecent([]);
  }, []);

  return { recent, add, clear };
}
