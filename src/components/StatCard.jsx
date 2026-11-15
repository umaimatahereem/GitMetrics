function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>

      <div className="stat-body">
        <strong>{value}</strong>
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
    </div>
  );
}

export default StatCard;
