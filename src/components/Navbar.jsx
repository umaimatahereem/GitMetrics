
import { Code2, BarChart3 } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <BarChart3 size={25} />
        <span>GitMetrics</span>
      </div>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="#analytics">Analytics</a>
        <a href="#repositories">Repositories</a>
      </div>

      <a
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
        className="github-link"
      >
        <Code2 size={19} />
        GitHub
      </a>
    </nav>
  );
}

export default Navbar;
