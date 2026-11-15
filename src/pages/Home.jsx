import { useState } from "react";
import { Activity, BookOpen, Clock, GitCompare, Search, TrendingUp } from "lucide-react";
import SearchBar from "../components/SearchBar";
import { resolveUsername } from "../utils/format";
import { navigate, userPath } from "../utils/router";

const EXAMPLES = ["octocat", "torvalds", "gaearon"];

const FEATURES = [
  {
    icon: Search,
    title: "Instant profile insights",
    text: "Followers, repositories, stars, forks and language mix from any public profile."
  },
  {
    icon: BookOpen,
    title: "Search, filter & sort",
    text: "Explore every repository by language, type or popularity, and export it as CSV."
  },
  {
    icon: Activity,
    title: "Activity analytics",
    text: "See active days, streaks, busiest weekdays and the hours a developer ships code."
  },
  {
    icon: GitCompare,
    title: "Compare developers",
    text: "Put two profiles side by side and see who leads on each metric."
  }
];

function Home({ recent, onClearRecent }) {
  const [error, setError] = useState("");

  const search = (raw) => {
    const { name, error: problem } = resolveUsername(raw);

    setError(problem);
    if (problem) return;

    navigate(userPath(name));
  };

  return (
    <main className="page home">
      <section className="hero">
        <div className="hero-badge">
          <TrendingUp size={16} />
          GitHub Analytics Platform
        </div>

        <h1>
          Understand your code.
          <br />
          <span>Measure your growth.</span>
        </h1>

        <p className="hero-description">
          Explore GitHub profiles, analyze repositories and discover meaningful insights about
          developer activity.
        </p>

        <SearchBar onSubmit={search} autoFocus />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="chip-row">
          <span className="chip-label">Try:</span>
          {EXAMPLES.map((name) => (
            <a key={name} className="chip" href={`#${userPath(name)}`}>
              {name}
            </a>
          ))}
        </div>

        {recent.length > 0 && (
          <div className="chip-row">
            <span className="chip-label">
              <Clock size={14} /> Recent:
            </span>

            {recent.map((name) => (
              <a key={name} className="chip" href={`#${userPath(name)}`}>
                {name}
              </a>
            ))}

            <button type="button" className="text-btn" onClick={onClearRecent}>
              Clear
            </button>
          </div>
        )}
      </section>

      <section className="feature-grid" aria-label="Features">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;

          return (
            <article key={feature.title} className="feature-card">
              <div className="stat-icon">
                <Icon size={20} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default Home;
