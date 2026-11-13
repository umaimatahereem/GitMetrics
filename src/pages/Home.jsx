import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  Search,
  Code2,
  TrendingUp,
  Users,
  BookOpen,
  MapPin,
  Star,
  GitFork
} from "lucide-react";

import {
  getUserProfile,
  getUserRepos
} from "../services/githubAPI";
const LANGUAGE_COLORS = [
  "#a78bfa",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#f472b6",
  "#22d3ee",
  "#818cf8"
];

function Home() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRepositoryHighlights, setShowRepositoryHighlights] = useState(false);
  const [showTopRepositories, setShowTopRepositories] = useState(false);
  const [showRecentlyUpdated, setShowRecentlyUpdated] = useState(false);
  const [showPopularRepositories, setShowPopularRepositories] = useState(false);
  const languageData = Object.entries(
  repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }

    return acc;
  }, {})
).map(([name, value]) => ({
  name,
  value
})).sort((a, b) => b.value - a.value);
const totalStars = repos.reduce(
  (total, repo) => total + repo.stargazers_count,
  0
);
const totalForks = repos.reduce(
  (total, repo) => total + repo.forks_count,
  0
);
const totalRepos = repos.length;
// Most-starred repository
const mostStarredRepo = [...repos].sort(
  (a, b) => b.stargazers_count - a.stargazers_count
)[0];

// Top 5 repositories by stars
const topRepositories = [...repos]
  .sort((a, b) => b.stargazers_count - a.stargazers_count)
  .slice(0, 5);

// 5 recently updated repositories
const recentlyUpdatedRepos = [...repos]
  .sort(
    (a, b) =>
      new Date(b.updated_at) - new Date(a.updated_at)
  )
  .slice(0, 5);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter a GitHub username.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProfile(null);
      setRepos([]);
const [profileData, repoData] = await Promise.all([
  getUserProfile(username.trim()),
  getUserRepos(username.trim())
]);


setProfile(profileData);
setRepos(repoData);
   } catch (err) {
  console.error("GitHub API Error:", err);
  console.log("Status:", err.response?.status);
  console.log("Response:", err.response?.data);

  if (err.response?.status === 404) {
    setError("GitHub user not found. Check the username.");
  } else if (err.response?.status === 403) {
    setError("GitHub API rate limit reached. Try again later.");
  } else if (err.code === "ECONNABORTED") {
    setError("Request timed out. Please try again.");
  } else {
    setError("Something went wrong. Please try again.");
  }
} finally {
  setLoading(false);
};
  };

  return (
    <main className="home">
      <section className="hero">

        <div className="hero-badge">
          <TrendingUp size={16} />
          GitHub Analytics Platform
        </div>

        <h1>
          Understand Your Code.
          <br />
          <span>Measure Your Growth.</span>
        </h1>

        <p className="hero-description">
          Explore GitHub profiles, analyze repositories,
          and discover meaningful insights about
          developer activity.
        </p>

        <form className="search-box" onSubmit={handleSubmit}>
          <Code2 size={21} />

          <input
            type="text"
            placeholder="Enter GitHub username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            <Search size={18} />
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        <p className="search-hint">
          Try searching for a GitHub username
        </p>

        {error && (
          <p className="error-message">{error}</p>
        )}
        {/* Loading Skeleton */}
{loading && (
  <section className="profile-result skeleton-container">

    <div className="skeleton-header">
      <div className="skeleton-avatar"></div>

      <div className="skeleton-info">
        <div className="skeleton-line title-line"></div>
        <div className="skeleton-line short-line"></div>
        <div className="skeleton-line"></div>
      </div>
    </div>

    <div className="skeleton-stats">
      <div className="skeleton-box"></div>
      <div className="skeleton-box"></div>
      <div className="skeleton-box"></div>
    </div>

    <div className="skeleton-chart"></div>

    <div className="skeleton-repos">
      <div className="skeleton-box"></div>
      <div className="skeleton-box"></div>
    </div>

  </section>
)}

        {profile && (
          <section className="profile-result">

            <div className="profile-header">
              <img
                src={profile.avatar_url}
                alt={profile.login}
                className="profile-avatar"
              />

              <div className="profile-info">
                <h2>{profile.name || profile.login}</h2>
                <p className="profile-username">
                  @{profile.login}
                </p>
                <p className="profile-bio">
                  {profile.bio || "No bio available"}
                </p>
              </div>
            </div>

            {profile.location && (
              <p className="profile-location">
                <MapPin size={16} />
                {profile.location}
              </p>
            )}

            <div className="profile-stats">

              <div className="stat-card">
                <BookOpen size={20} />
                <h3>{profile.public_repos}</h3>
                <p>Repositories</p>
              </div>

              <div className="stat-card">
                <Users size={20} />
                <h3>{profile.followers}</h3>
                <p>Followers</p>
              </div>

              <div className="stat-card">
                <Users size={20} />
                <h3>{profile.following}</h3>
                <p>Following</p>
              </div>

            </div>

{/* ANALYTICS SUMMARY */}
<div className="analytics-grid">

  <div className="analytics-card">
    <Star size={24} />
    <h3>{totalStars}</h3>
    <p>Total Stars</p>
  </div>

  <div className="analytics-card">
    <GitFork size={24} />
    <h3>{totalForks}</h3>
    <p>Total Forks</p>
  </div>

  <div className="analytics-card">
    <BookOpen size={24} />
    <h3>{totalRepos}</h3>
    <p>Repositories Analyzed</p>
  </div>

</div>

{/* REPOSITORY ANALYTICS */}
<div className="repository-analytics-grid">

 {/* Repository Highlights */}
<div className="highlights-container">

  <button
    className={`highlights-button ${showRepositoryHighlights ? "active" : ""}`}
    onClick={() =>
      setShowRepositoryHighlights(!showRepositoryHighlights)
    }
  >
    <span>Repository Highlights</span>
    <span className="highlights-arrow">⌄</span>
  </button>

  {showRepositoryHighlights && (
    <div className="analytics-section">

    {mostStarredRepo && (
      <div className="highlight-card">
        <h3>⭐ Most Starred Repository</h3>
        <h2>{mostStarredRepo.name}</h2>

        <p>
          {mostStarredRepo.description ||
            "No description available"}
        </p>

        <p>⭐ {mostStarredRepo.stargazers_count} Stars</p>

        <a
          href={mostStarredRepo.html_url}
          target="_blank"
          rel="noreferrer"
        >
          View Repository →
        </a>
      </div>
    )}
  </div>
   )}
  </div>

  {/* Top 5 Repositories */}
 <div className="highlights-container">

  <button
    className={`highlights-button ${showTopRepositories ? "active" : ""}`}
    onClick={() => setShowTopRepositories(!showTopRepositories)}
  >
    <span>🏆 Top 5 Repositories</span>
    <span className="highlights-arrow">⌄</span>
  </button>

  {showTopRepositories && (
    <div className="top-repositories">
    {topRepositories.map((repo, index) => (
      <div className="top-repo-card" key={repo.id}>
        <h4>{index + 1}. {repo.name}</h4>
        <p>⭐ {repo.stargazers_count} Stars</p>

        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
        >
          View Repository →
        </a>
      </div>
    ))}
  </div>
  )}
  </div>
  {/* Recently Updated Repositories */}
 <div className="highlights-container">

  <button
    className={`highlights-button ${showRecentlyUpdated ? "active" : ""}`}
    onClick={() => setShowRecentlyUpdated(!showRecentlyUpdated)}
  >
    <span>🕒 Recently Updated Repositories</span>
    <span className="highlights-arrow">⌄</span>
  </button>

  {showRecentlyUpdated && (
    <div className="recent-repositories">

    {recentlyUpdatedRepos.map((repo) => (
      <div className="recent-repo-card" key={repo.id}>
        <h4>{repo.name}</h4>

        <p>
          Last updated:{" "}
          {new Date(repo.updated_at).toLocaleDateString()}
        </p>

        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
        >
          View Repository →
        </a>
      </div>
    ))}
  </div>
  )}
  </div>

</div>


            <a
              href={profile.html_url}
              target="_blank"
              rel="noreferrer"
              className="profile-link"
            >
              View GitHub Profile ↗
            </a>

{/* LANGUAGE ANALYTICS */}

<div className="language-section">

  <h2>Programming Languages</h2>

  {languageData.length > 0 ? (

    <div className="language-chart">

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>

          <Pie
            data={languageData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={4}
          >

            {languageData.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={
                  LANGUAGE_COLORS[
                    index % LANGUAGE_COLORS.length
                  ]
                }
              />
            ))}

          </Pie>

          <Tooltip
            formatter={(value, name) => [
              `${value} repositories`,
              name
            ]}
          />

          <Legend />

        </PieChart>
      </ResponsiveContainer>

    </div>

  ) : (
    <p className="no-language">
      No programming language data available.
    </p>
  )}

</div>

{/* POPULAR REPOSITORIES */}

<div className="popular-container">

  <button
    className={`popular-button ${showPopularRepositories ? "active" : ""}`}
    onClick={() =>
      setShowPopularRepositories(!showPopularRepositories)
    }
  >
    <span>⭐ Popular Repositories</span>
    <span className="highlights-arrow">⌄</span>
  </button>

  {showPopularRepositories && (
    <div className="popular-content">

      {/* KEEP YOUR EXISTING REPOSITORY CARDS HERE */}
      
<div className="repositories-section">

  <h2>Popular Repositories</h2>

  <div className="repo-grid">

    {[...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map((repo) => (

        <div className="repo-card" key={repo.id}>

          <h3>{repo.name}</h3>

          <p className="repo-description">
            {repo.description || "No description available"}
          </p>

          <div className="repo-details">

            <span>
              <Star size={15} />
              {repo.stargazers_count}
            </span>

            <span>
              <GitFork size={15} />
              {repo.forks_count}
            </span>

            <span>
              {repo.language || "Unknown"}
            </span>

          </div>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
          >
            View Repository ↗
          </a>

        </div>

      ))}

  </div>

</div>

    </div>
  )}

</div>



          </section>
          
        )}

      </section>
    </main>
  );
}

export default Home;
