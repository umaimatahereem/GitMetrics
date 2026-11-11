import { useState } from "react";
import {
  Search,
  Code2,
  TrendingUp,
  Users,
  BookOpen,
  MapPin
} from "lucide-react";

import { getUserProfile } from "../services/githubAPI";

function Home() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const data = await getUserProfile(username.trim());

      setProfile(data);
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

          </section>
        )}

      </section>
    </main>
  );
}

export default Home;
