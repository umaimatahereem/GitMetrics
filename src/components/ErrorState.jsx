import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

function ErrorState({ title = "Couldn't load this profile", message, onRetry }) {
  return (
    <div className="state-card" role="alert">
      <div className="state-icon danger">
        <AlertTriangle size={26} />
      </div>

      <h2>{title}</h2>
      <p>{message}</p>

      <div className="state-actions">
        {onRetry && (
          <button type="button" className="primary-btn" onClick={onRetry}>
            <RefreshCw size={16} />
            <span>Try again</span>
          </button>
        )}

        <a href="#/" className="ghost-btn">
          <ArrowLeft size={16} />
          <span>Back to search</span>
        </a>
      </div>
    </div>
  );
}

export default ErrorState;
