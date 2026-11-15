import { Component } from "react";

/** Last line of defence: shows a friendly screen instead of a blank page. */
class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("Unexpected UI error:", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="page">
        <div className="state-card">
          <h2>Something went wrong</h2>
          <p>The page hit an unexpected problem. Reloading usually fixes it.</p>

          <div className="state-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                window.location.hash = "/";
                window.location.reload();
              }}
            >
              Reload GitMetrics
            </button>
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
