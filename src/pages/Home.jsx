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
      if (err.response?.status === 404) {
        setError("GitHub user not found. Check the username.");
      } else if (err.response?.status === 403) {
        setError("GitHub API rate limit reached. Try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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



          </section>
          
        )}

      </section>
    </main>
  );
}

export default Home;
