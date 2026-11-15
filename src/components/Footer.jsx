function Footer({ rate }) {
  const resetTime = rate
    ? new Date(rate.reset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const low = rate && rate.remaining <= Math.max(5, rate.limit * 0.1);

  return (
    <footer className="footer">
      <p>
        GitMetrics uses public data from the GitHub REST API. Not affiliated with GitHub.
      </p>

      {rate && (
        <p className={`rate-info ${low ? "low" : ""}`} title={`Resets around ${resetTime}`}>
          API requests left: <strong>{rate.remaining}</strong> / {rate.limit}
          {rate.authenticated ? " (token)" : ""}
          {low ? ` - resets ${resetTime}` : ""}
        </p>
      )}
    </footer>
  );
}

export default Footer;
