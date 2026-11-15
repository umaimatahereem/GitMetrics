import { useEffect, useState } from "react";
import { parseHash } from "./router.pure";

/**
 * Minimal hash router, so the app needs no extra dependency and works on
 * any static host (GitHub Pages, Netlify, ...) without server config.
 *
 *   #/                          home
 *   #/user/octocat              dashboard (overview tab)
 *   #/user/octocat/activity     dashboard, specific tab
 *   #/compare                   compare page
 *   #/compare/octocat/torvalds  compare two developers
 */

export { parseHash, userPath, comparePath } from "./router.pure";

export function navigate(path) {
  window.location.hash = path.startsWith("/") ? path : `/${path}`;
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}
