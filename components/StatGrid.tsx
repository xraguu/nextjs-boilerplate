// components/StatGrid.tsx
type Stat = { label: string; value: string | number };
export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="stat-grid">
      {stats.map((s, i) => (
        <div className="stat" key={i}>
          <div className="label">{s.label}</div>
          <div className="value">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

// import StatGrid from "@/components/StatGrid";

// <StatGrid stats={[
//   { label: "Weekly Rank", value: 3 },
//   { label: "Total Pts", value: 742 },
//   { label: "Record", value: "7–3" },
//   { label: "Waiver Priority", value: 5 },
// ]} />
