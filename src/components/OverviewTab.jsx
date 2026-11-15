import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { BookOpen, Code2, GitFork, Star, TrendingUp, Users } from "lucide-react";
import StatCard from "./StatCard";
import LanguageDonut from "./LanguageDonut";
import {
  languageBreakdown,
  recentRepos,
  reposByYear,
  topRepos
} from "../utils/analytics";
import { formatCompact, formatDecimal, formatFull, timeAgo } from "../utils/format";
import { CHART_COLORS } from "../utils/languages";

const axisTick = { fill: "var(--text-muted)", fontSize: 12 };

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 13
};

function OverviewTab({ profile, repos, summary }) {
  if (!repos.length) {
    return (
      <div className="state-card slim">
        <h2>No public repositories yet</h2>
        <p>Once this developer publishes repositories, their analytics will appear here.</p>
      </div>
    );
  }

  const languages = languageBreakdown(repos);
  const years = reposByYear(repos);
  const top = topRepos(repos, 5);
  const recent = recentRepos(repos, 5);
  const maxStars = Math.max(1, ...top.map((repo) => repo.stargazers_count));
  const truncated = profile.public_repos > repos.length;

  return (
    <div className="tab-content">
      {truncated && (
        <p className="notice">
          Analyzing the {formatFull(repos.length)} most recent of{" "}
          {formatFull(profile.public_repos)} public repositories.
        </p>
      )}

      <div className="stat-grid">
        <StatCard icon={BookOpen} label="Repositories analyzed" value={formatFull(summary.totalRepos)} />
        <StatCard icon={Star} label="Total stars" value={formatCompact(summary.totalStars)} />
        <StatCard icon={GitFork} label="Total forks" value={formatCompact(summary.totalForks)} />
        <StatCard icon={Code2} label="Languages used" value={summary.languageCount} hint={`Top: ${summary.topLanguage}`} />
        <StatCard icon={TrendingUp} label="Avg stars per repo" value={formatDecimal(summary.avgStars)} />
        <StatCard
          icon={Users}
          label="Original / forked"
          value={`${summary.sourceRepos} / ${summary.forkRepos}`}
        />
      </div>

      <div className="two-col">
        <section className="card panel">
          <h2>Programming languages</h2>
          <p className="panel-sub">Share of repositories by primary language</p>
          <LanguageDonut data={languages} />
        </section>

        <section className="card panel">
          <h2>Repositories created per year</h2>
          <p className="panel-sub">How the portfolio has grown over time</p>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={years} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "var(--accent-soft)" }}
                contentStyle={tooltipStyle}
                labelStyle={{ color: "var(--text-muted)" }}
                formatter={(value) => [value, "Repositories"]}
              />
              <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="two-col">
        <section className="card panel">
          <h2>Top 5 repositories</h2>
          <p className="panel-sub">Ranked by stars</p>

          <ol className="rank-list">
            {top.map((repo, index) => (
              <li key={repo.id}>
                <span className="rank-number">{index + 1}</span>

                <div className="rank-body">
                  <div className="rank-line">
                    <a href={repo.html_url} target="_blank" rel="noreferrer">
                      {repo.name}
                    </a>
                    <span className="rank-value">
                      <Star size={13} />
                      {formatFull(repo.stargazers_count)}
                    </span>
                  </div>

                  <div className="bar-track" aria-hidden="true">
                    <div
                      className="bar-fill"
                      style={{ width: `${(repo.stargazers_count / maxStars) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card panel">
          <h2>Recently updated</h2>
          <p className="panel-sub">Latest pushes across all repositories</p>

          <ul className="recent-list">
            {recent.map((repo) => (
              <li key={repo.id}>
                <div>
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    {repo.name}
                  </a>
                  <small>{repo.language || "Unknown"}</small>
                </div>

                <span>{timeAgo(repo.pushed_at || repo.updated_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default OverviewTab;
