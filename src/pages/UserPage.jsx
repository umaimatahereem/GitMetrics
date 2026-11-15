import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowLeft, BarChart3, BookOpen } from "lucide-react";
import SearchBar from "../components/SearchBar";
import ProfileHeader from "../components/ProfileHeader";
import OverviewTab from "../components/OverviewTab";
import RepositoriesTab from "../components/RepositoriesTab";
import ActivityTab from "../components/ActivityTab";
import DashboardSkeleton from "../components/DashboardSkeleton";
import ErrorState from "../components/ErrorState";
import { useGithubUser } from "../hooks/useGithubUser";
import { activityFromEvents, summarizeRepos } from "../utils/analytics";
import { resolveUsername } from "../utils/format";
import { navigate, userPath } from "../utils/router";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "repositories", label: "Repositories", icon: BookOpen },
  { id: "activity", label: "Activity", icon: Activity }
];

function UserPage({ username, tab, onLoaded }) {
  const { status, profile, repos, events, eventsError, error, load } = useGithubUser();

  useEffect(() => {
    load(username);
  }, [username, load]);

  useEffect(() => {
    if (status === "success" && profile) onLoaded(profile.login);
  }, [status, profile, onLoaded]);

  const summary = useMemo(() => summarizeRepos(repos), [repos]);
  const activity = useMemo(() => activityFromEvents(events), [events]);

  const activeTab = TABS.some((item) => item.id === tab) ? tab : "overview";
  const loading = status === "idle" || status === "loading";

  const [searchError, setSearchError] = useState("");

  const searchAnother = (raw) => {
    const { name, error: problem } = resolveUsername(raw);

    setSearchError(problem);
    if (problem) return;

    navigate(userPath(name));
  };

  return (
    <main className="page">
      <div className="page-top">
        <a href="#/" className="back-link">
          <ArrowLeft size={16} />
          <span>Home</span>
        </a>

        <SearchBar
          compact
          initialValue={username}
          onSubmit={searchAnother}
          loading={loading}
          buttonLabel="Analyze"
        />
      </div>

      {searchError && <p className="form-error">{searchError}</p>}

      {loading && <DashboardSkeleton />}

      {status === "error" && (
        <ErrorState message={error} onRetry={() => load(username)} />
      )}

      {status === "success" && profile && (
        <div className="dashboard">
          <ProfileHeader profile={profile} />

          <nav className="tabs" role="tablist" aria-label="Dashboard sections">
            {TABS.map((item) => {
              const Icon = item.icon;
              const selected = item.id === activeTab;

              return (
                <a
                  key={item.id}
                  href={`#${userPath(profile.login, item.id)}`}
                  role="tab"
                  aria-selected={selected}
                  className={selected ? "active" : ""}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {activeTab === "overview" && (
            <OverviewTab profile={profile} repos={repos} summary={summary} />
          )}

          {activeTab === "repositories" && (
            <RepositoriesTab repos={repos} username={profile.login} />
          )}

          {activeTab === "activity" && (
            <ActivityTab activity={activity} eventsError={eventsError} />
          )}
        </div>
      )}
    </main>
  );
}

export default UserPage;
