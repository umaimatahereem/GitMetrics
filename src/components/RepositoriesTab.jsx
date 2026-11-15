import { useMemo, useState } from "react";
import { Download, LayoutGrid, List, Search, X } from "lucide-react";
import RepoCard from "./RepoCard";
import {
  SORT_OPTIONS,
  TYPE_OPTIONS,
  filterAndSortRepos,
  repoLanguages
} from "../utils/analytics";
import { downloadTextFile, reposToCsv } from "../utils/format";

const PAGE_SIZE = 12;

const DEFAULT_FILTERS = { query: "", language: "all", type: "all", sort: "stars" };

function RepositoriesTab({ repos, username }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState("grid");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const languages = useMemo(() => repoLanguages(repos), [repos]);
  const results = useMemo(() => filterAndSortRepos(repos, filters), [repos, filters]);

  const filtersActive =
    filters.query !== "" || filters.language !== "all" || filters.type !== "all";

  const update = (key) => (event) => {
    setFilters((current) => ({ ...current, [key]: event.target.value }));
    setVisible(PAGE_SIZE);
  };

  const reset = () => {
    setFilters(DEFAULT_FILTERS);
    setVisible(PAGE_SIZE);
  };

  const exportCsv = () => {
    downloadTextFile(`${username}-repositories.csv`, reposToCsv(results));
  };

  if (!repos.length) {
    return (
      <div className="state-card slim">
        <h2>No public repositories yet</h2>
        <p>This developer hasn't published any public repositories.</p>
      </div>
    );
  }

  const shown = results.slice(0, visible);

  return (
    <div className="tab-content">
      <div className="toolbar card">
        <label className="field search-field">
          <Search size={16} />
          <input
            type="search"
            value={filters.query}
            onChange={update("query")}
            placeholder="Search by name, description or topic..."
            aria-label="Search repositories"
          />
        </label>

        <label className="field">
          <span className="sr-only">Language</span>
          <select value={filters.language} onChange={update("language")}>
            <option value="all">All languages</option>
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="sr-only">Type</span>
          <select value={filters.type} onChange={update("type")}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="sr-only">Sort by</span>
          <select value={filters.sort} onChange={update("sort")}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="view-toggle" role="group" aria-label="Layout">
          <button
            type="button"
            className={view === "grid" ? "active" : ""}
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <LayoutGrid size={16} />
          </button>

          <button
            type="button"
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div className="result-bar">
        <p>
          Showing <strong>{Math.min(visible, results.length)}</strong> of{" "}
          <strong>{results.length}</strong> repositories
        </p>

        <div className="result-actions">
          {filtersActive && (
            <button type="button" className="text-btn" onClick={reset}>
              <X size={14} />
              Clear filters
            </button>
          )}

          <button
            type="button"
            className="text-btn"
            onClick={exportCsv}
            disabled={!results.length}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="state-card slim">
          <h2>No matching repositories</h2>
          <p>Try a different search term or clear the filters.</p>

          <div className="state-actions">
            <button type="button" className="primary-btn" onClick={reset}>
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`repo-grid ${view}`}>
            {shown.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>

          {visible < results.length && (
            <div className="load-more">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
              >
                Show more ({results.length - visible} left)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RepositoriesTab;
