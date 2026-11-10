
import { useState } from "react";
import { Search, Code2, TrendingUp } from "lucide-react";

function Home() {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim()) return;

    console.log("Searching for:", username);
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

          <button type="submit">
            <Search size={18} />
            Analyze
          </button>
        </form>

        <p className="search-hint">
          Try searching for a GitHub username
        </p>

      </section>
    </main>
  );
}

export default Home;
