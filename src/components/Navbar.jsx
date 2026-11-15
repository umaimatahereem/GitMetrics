import { BarChart3, Code2, GitCompare, Moon, Search, Sun } from "lucide-react";

function Navbar({ route, theme, onToggleTheme }) {
  const onCompare = route.name === "compare";
  const onSearch = route.name === "home" || route.name === "user";

  return (
    <header className="navbar">
      <a className="logo" href="#/" aria-label="GitMetrics home">
        <BarChart3 size={24} />
        <span>GitMetrics</span>
      </a>

      <nav className="nav-links" aria-label="Main">
        <a href="#/" className={onSearch ? "active" : ""}>
          <Search size={16} />
          <span>Search</span>
        </a>

        <a href="#/compare" className={onCompare ? "active" : ""}>
          <GitCompare size={16} />
          <span>Compare</span>
        </a>
      </nav>

      <div className="nav-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Light theme" : "Dark theme"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="github-link"
        >
          <Code2 size={18} />
          <span>GitHub</span>
        </a>
      </div>
    </header>
  );
}

export default Navbar;
