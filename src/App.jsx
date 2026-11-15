import { useCallback, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import UserPage from "./pages/UserPage";
import ComparePage from "./pages/ComparePage";
import { useHashRoute } from "./utils/router";
import { useTheme } from "./hooks/useTheme";
import { useRecentSearches } from "./hooks/useRecentSearches";
import { useRateLimit } from "./hooks/useRateLimit";
import "./App.css";

function App() {
  const route = useHashRoute();
  const [theme, toggleTheme] = useTheme();
  const { recent, add, clear } = useRecentSearches();
  const { rate, refresh } = useRateLimit();

  const handleUserLoaded = useCallback(
    (login) => {
      add(login);
      refresh();
    },
    [add, refresh]
  );

  const handleCompareLoaded = useCallback(() => {
    refresh();
  }, [refresh]);

  // Page title + scroll to top when moving between pages (not between tabs).
  useEffect(() => {
    if (route.name === "user") document.title = `${route.username} - GitMetrics`;
    else if (route.name === "compare") document.title = "Compare developers - GitMetrics";
    else document.title = "GitMetrics - GitHub Analytics Dashboard";

    window.scrollTo(0, 0);
  }, [route.name, route.username, route.a, route.b]);

  let page;

  if (route.name === "user") {
    page = <UserPage username={route.username} tab={route.tab} onLoaded={handleUserLoaded} />;
  } else if (route.name === "compare") {
    page = <ComparePage a={route.a} b={route.b} onLoaded={handleCompareLoaded} />;
  } else {
    page = <Home recent={recent} onClearRecent={clear} />;
  }

  return (
    <ErrorBoundary>
      <Navbar route={route} theme={theme} onToggleTheme={toggleTheme} />
      {page}
      <Footer rate={rate} />
    </ErrorBoundary>
  );
}

export default App;
