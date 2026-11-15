import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { groupLanguages } from "../utils/analytics";
import { languageColor } from "../utils/languages";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 13
};

function LanguageDonut({ data }) {
  if (!data.length) {
    return <p className="muted-note">No language data available for these repositories.</p>;
  }

  const grouped = groupLanguages(data, 7);
  const total = grouped.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="donut-layout">
      <div className="donut-chart">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={grouped}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
              stroke="none"
            >
              {grouped.map((entry, index) => (
                <Cell key={entry.name} fill={languageColor(entry.name, index)} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: "var(--text)" }}
              formatter={(value, name) => [`${value} repositories`, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="donut-center" aria-hidden="true">
          <strong>{total}</strong>
          <span>repos</span>
        </div>
      </div>

      <ul className="legend-list">
        {grouped.map((item, index) => (
          <li key={item.name}>
            <span
              className="legend-dot"
              style={{ background: languageColor(item.name, index) }}
            />
            <span className="legend-name">{item.name}</span>
            <span className="legend-value">{item.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LanguageDonut;
