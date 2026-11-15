import { Archive, ExternalLink, GitFork, Star } from "lucide-react";
import { formatCompact, timeAgo } from "../utils/format";
import { languageColor } from "../utils/languages";

function RepoCard({ repo }) {
  const topics = (repo.topics || []).slice(0, 3);

  return (
    <article className="repo-card">
      <header className="repo-head">
        <h3>
          <a href={repo.html_url} target="_blank" rel="noreferrer">
            {repo.name}
          </a>
        </h3>

        <div className="badges">
          {repo.fork && <span className="badge">Fork</span>}
          {repo.archived && (
            <span className="badge warn">
              <Archive size={12} />
              Archived
            </span>
          )}
        </div>
      </header>

      <p className="repo-description">{repo.description || "No description available."}</p>

      {topics.length > 0 && (
        <ul className="topic-list">
          {topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      )}

      <footer className="repo-meta">
        <span className="meta-item">
          <i
            className="lang-dot"
            style={{ background: languageColor(repo.language || "Unknown") }}
          />
          {repo.language || "Unknown"}
        </span>

        <span className="meta-item" title="Stars">
          <Star size={14} />
          {formatCompact(repo.stargazers_count)}
        </span>

        <span className="meta-item" title="Forks">
          <GitFork size={14} />
          {formatCompact(repo.forks_count)}
        </span>

        <span className="meta-item updated">Updated {timeAgo(repo.pushed_at || repo.updated_at)}</span>

        <a
          className="repo-open"
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${repo.name} on GitHub`}
        >
          <ExternalLink size={15} />
        </a>
      </footer>
    </article>
  );
}

export default RepoCard;
