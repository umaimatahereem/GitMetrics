function DashboardSkeleton() {
  return (
    <div className="skeleton-wrap" aria-busy="true" aria-label="Loading profile">
      <div className="card skeleton-profile">
        <div className="skeleton skeleton-avatar" />

        <div className="skeleton-lines">
          <div className="skeleton skeleton-line title" />
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>

      <div className="skeleton-tabs">
        <div className="skeleton skeleton-pill" />
        <div className="skeleton skeleton-pill" />
        <div className="skeleton skeleton-pill" />
      </div>

      <div className="stat-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton skeleton-stat" />
        ))}
      </div>

      <div className="two-col">
        <div className="skeleton skeleton-panel" />
        <div className="skeleton skeleton-panel" />
      </div>
    </div>
  );
}

export default DashboardSkeleton;
