import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GitCompare, Trophy } from "lucide-react";
import ErrorState from "../components/ErrorState";
import { describeError, fetchUserBundle } from "../services/githubAPI";
import {
  activityFromEvents,
  buildComparisonRows,
  compareLanguages,
  scoreComparison,
  summarizeRepos
} from "../utils/analytics";
import { formatDecimal, formatFull, resolveUsername } from "../utils/format";
import { comparePath, navigate, userPath } from "../utils/router";
import { languageColor } from "../utils/languages";

const IDLE = { status: "idle", data: null, error: "" };

function prepare(bundle) {
  return {
    ...bundle,
    summary: summarizeRepos(bundle.repos),
    activity: activityFromEvents(bundle.events)
  };
}

function formatValue(value, format) {
  return format === "decimal" ? formatDecimal(value, 1) : formatFull(value);
}

function DeveloperCard({ side, leads, wins }) {
  const { profile } = side;

  return (
    <article className={`card compare-dev ${leads ? "leader" : ""}`}>
      <img src={profile.avatar_url} alt="" width="72" height="72" className="profile-avatar small" />

      <div className="compare-dev-info">
        <h2>{profile.name || profile.login}</h2>
        <a href={`#${userPath(profile.login)}`}>@{profile.login}</a>
        <p>{profile.bio || "No bio available."}</p>
      </div>

      <div className="compare-score">
        <strong>{wins}</strong>
        <span>metrics won</span>
        {leads && (
          <span className="leader-tag">
            <Trophy size={13} /> Leads
          </span>
        )}
      </div>
    </article>
  );
}

function ComparePage({ a, b, onLoaded }) {
  const [state, setState] = useState(IDLE);
  const [form, setForm] = useState({ a, b });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm({ a, b });
  }, [a, b]);

  useEffect(() => {
    if (!a || !b) {
      setState(IDLE);
      return undefined;
    }

    if (a.toLowerCase() === b.toLowerCase()) {
      setState({ status: "error", data: null, error: "Pick two different developers to compare." });
      return undefined;
    }

    let cancelled = false;
    setState({ status: "loading", data: null, error: "" });

    Promise.allSettled([fetchUserBundle(a), fetchUserBundle(b)]).then(([first, second]) => {
      if (cancelled) return;

      const failure = [
        [first, a],
        [second, b]
      ].find(([result]) => result.status === "rejected");

      if (failure) {
        const [result, name] = failure;
        setState({ status: "error", data: null, error: describeError(result.reason, name) });
        return;
      }

      setState({
        status: "success",
        data: { a: prepare(first.value), b: prepare(second.value) },
        error: ""
      });

      onLoaded();
    });

    return () => {
      cancelled = true;
    };
  }, [a, b, onLoaded]);

  const comparison = useMemo(() => {
    if (state.status !== "success") return null;

    const rows = buildComparisonRows(state.data.a, state.data.b);

    return {
      rows,
      score: scoreComparison(rows),
      languages: compareLanguages(state.data.a.repos, state.data.b.repos)
    };
  }, [state]);

  const submit = (event) => {
    event.preventDefault();

    const first = resolveUsername(form.a);
    const second = resolveUsername(form.b);

    if (first.error || second.error) {
      setFormError(first.error || second.error);
      return;
    }

    if (first.name.toLowerCase() === second.name.toLowerCase()) {
      setFormError("Pick two different developers to compare.");
      return;
    }

    setFormError("");
    navigate(comparePath(first.name, second.name));
  };

  const loading = state.status === "loading";

  return (
    <main className="page">
      <div className="page-top">
        <a href="#/" className="back-link">
          <ArrowLeft size={16} />
          <span>Home</span>
        </a>
      </div>

      <section className="compare-intro">
        <h1>Compare developers</h1>
        <p>Enter two GitHub usernames and see who leads on each metric.</p>

        <form className="compare-form" onSubmit={submit}>
          <input
            type="text"
            value={form.a}
            onChange={(event) => setForm((f) => ({ ...f, a: event.target.value }))}
            placeholder="First username"
            aria-label="First GitHub username"
            autoComplete="off"
            spellCheck={false}
          />

          <span className="vs">vs</span>

          <input
            type="text"
            value={form.b}
            onChange={(event) => setForm((f) => ({ ...f, b: event.target.value }))}
            placeholder="Second username"
            aria-label="Second GitHub username"
            autoComplete="off"
            spellCheck={false}
          />

          <button type="submit" className="primary-btn" disabled={loading}>
            <GitCompare size={17} />
            <span>{loading ? "Comparing..." : "Compare"}</span>
          </button>
        </form>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
      </section>

      {state.status === "idle" && (
        <div className="state-card slim">
          <h2>Pick two developers</h2>
          <p>
            Try <a href={`#${comparePath("torvalds", "gaearon")}`}>torvalds vs gaearon</a>.
          </p>
        </div>
      )}

      {loading && (
        <div className="skeleton-wrap" aria-busy="true">
          <div className="two-col">
            <div className="skeleton skeleton-panel short" />
            <div className="skeleton skeleton-panel short" />
          </div>
          <div className="skeleton skeleton-panel" />
        </div>
      )}

      {state.status === "error" && (
        <ErrorState title="Couldn't compare these developers" message={state.error} />
      )}

      {comparison && (
        <div className="dashboard">
          <div className="two-col">
            <DeveloperCard
              side={state.data.a}
              wins={comparison.score.a}
              leads={comparison.score.a > comparison.score.b}
            />
            <DeveloperCard
              side={state.data.b}
              wins={comparison.score.b}
              leads={comparison.score.b > comparison.score.a}
            />
          </div>

          <section className="card panel">
            <h2>Head to head</h2>
            <p className="panel-sub">
              {comparison.score.a === comparison.score.b
                ? "It's a tie overall."
                : `${
                    comparison.score.a > comparison.score.b
                      ? state.data.a.profile.login
                      : state.data.b.profile.login
                  } leads in more metrics.`}{" "}
              Higher is better in every row.
            </p>

            <div className="compare-table">
              {comparison.rows.map((row) => {
                const max = Math.max(row.a, row.b, 0.0001);

                return (
                  <div key={row.key} className="compare-row">
                    <div className={`compare-value left ${row.winner === "a" ? "win" : ""}`}>
                      {formatValue(row.a, row.format)}
                    </div>

                    <div className="compare-middle">
                      <span className="compare-label">{row.label}</span>

                      <div className="dual-bars" aria-hidden="true">
                        <div className="dual-side left">
                          <div className="dual-fill" style={{ width: `${(row.a / max) * 100}%` }} />
                        </div>
                        <div className="dual-side right">
                          <div className="dual-fill alt" style={{ width: `${(row.b / max) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className={`compare-value right ${row.winner === "b" ? "win" : ""}`}>
                      {formatValue(row.b, row.format)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card panel">
            <h2>Languages</h2>
            <p className="panel-sub">What they have in common, and what's unique</p>

            <div className="lang-compare">
              <div>
                <h3>Only {state.data.a.profile.login}</h3>
                <LanguageChips names={comparison.languages.onlyA} />
              </div>

              <div>
                <h3>Both use</h3>
                <LanguageChips names={comparison.languages.shared} />
              </div>

              <div>
                <h3>Only {state.data.b.profile.login}</h3>
                <LanguageChips names={comparison.languages.onlyB} />
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function LanguageChips({ names }) {
  if (!names.length) return <p className="muted-note">None</p>;

  return (
    <ul className="lang-chips">
      {names.map((name, index) => (
        <li key={name}>
          <i className="lang-dot" style={{ background: languageColor(name, index) }} />
          {name}
        </li>
      ))}
    </ul>
  );
}

export default ComparePage;
