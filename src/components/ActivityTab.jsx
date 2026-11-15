import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Activity, Calendar, Clock, Flame, GitFork } from "lucide-react";
import StatCard from "./StatCard";
import ErrorState from "./ErrorState";
import { formatFull } from "../utils/format";
import { CHART_COLORS } from "../utils/languages";

const axisTick = { fill: "var(--text-muted)", fontSize: 12 };

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 13
};

function ActivityTab({ activity, eventsError }) {
  if (eventsError) {
    return (
      <ErrorState
        title="Activity is unavailable"
        message="GitHub didn't return recent activity for this user (possibly a rate limit). The other tabs still work - try again in a little while."
      />
    );
  }

  if (!activity.totalEvents) {
    return (
      <div className="state-card slim">
        <h2>No recent public activity</h2>
        <p>GitHub shows no public events for this user in the last 90 days.</p>
      </div>
    );
  }

  const maxType = Math.max(1, ...activity.byType.map((item) => item.value));
  const maxRepo = Math.max(1, ...activity.topRepos.map((item) => item.count));

  return (
    <div className="tab-content">
      <p className="notice">
        Based on the latest public events GitHub provides (up to 300 events from the last 90
        days). Times use your local timezone.
      </p>

      <div className="stat-grid">
        <StatCard icon={Activity} label="Public events" value={formatFull(activity.totalEvents)} />
        <StatCard icon={GitFork} label="Pushes" value={formatFull(activity.pushes)} hint="to public repositories" />
        <StatCard icon={Calendar} label="Active days" value={activity.activeDays} hint="in the last 90 days" />
        <StatCard
          icon={Flame}
          label="Current streak"
          value={`${activity.streak.current} day${activity.streak.current === 1 ? "" : "s"}`}
          hint={`Longest: ${activity.streak.longest}`}
        />
        <StatCard icon={Calendar} label="Busiest day" value={activity.busiestDay} />
        <StatCard icon={Clock} label="Peak hour" value={activity.peakHour} />
      </div>

      <section className="card panel">
        <h2>Activity over the last 30 days</h2>
        <p className="panel-sub">Public events per day</p>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={activity.daily} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--text-muted)" }}
              formatter={(value) => [value, "Events"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              fill="url(#activityFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <div className="two-col">
        <section className="card panel">
          <h2>By day of the week</h2>
          <p className="panel-sub">When this developer is most active</p>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activity.byWeekday} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "var(--accent-soft)" }}
                contentStyle={tooltipStyle}
                formatter={(value) => [value, "Events"]}
              />
              <Bar dataKey="count" fill={CHART_COLORS.secondary} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="card panel">
          <h2>By hour of the day</h2>
          <p className="panel-sub">Morning person or night owl?</p>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activity.byHour} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tick={axisTick} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "var(--accent-soft)" }}
                contentStyle={tooltipStyle}
                labelFormatter={(hour) => `${String(hour).padStart(2, "0")}:00`}
                formatter={(value) => [value, "Events"]}
              />
              <Bar dataKey="count" fill={CHART_COLORS.warm} radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="two-col">
        <section className="card panel">
          <h2>What they do</h2>
          <p className="panel-sub">Event types</p>

          <ul className="bar-list">
            {activity.byType.map((item) => (
              <li key={item.name}>
                <div className="bar-line">
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div className="bar-fill" style={{ width: `${(item.value / maxType) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card panel">
          <h2>Most active repositories</h2>
          <p className="panel-sub">Where the recent work happens</p>

          <ul className="bar-list">
            {activity.topRepos.map((item) => (
              <li key={item.name}>
                <div className="bar-line">
                  <a href={`https://github.com/${item.name}`} target="_blank" rel="noreferrer">
                    {item.name}
                  </a>
                  <strong>{item.count}</strong>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div className="bar-fill alt" style={{ width: `${(item.count / maxRepo) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default ActivityTab;
