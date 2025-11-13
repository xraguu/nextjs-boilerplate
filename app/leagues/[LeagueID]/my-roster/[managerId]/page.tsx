"use client";

import { useState } from "react";

// Mock roster data
const mockRoster = {
  managerName: "Nick",
  teamName: "Nick's Bumps",
  record: { wins: 5, losses: 3 },
  rank: 3,
  weeklyPoints: 152.5,
  totalPoints: 1150.0,
  currentWeek: 3,
  lineupLocked: false,
  teams: [
    // 2v2 Slots
    { slot: "2s", name: "Flames CL", score: 48.5, opponent: "Puffins CL", oprk: 2, fprk: 1, fpts: 425.0, avg: 53.1, last: 52.0 },
    { slot: "2s", name: "Torch ML", score: 46.0, opponent: "Eclipse ML", oprk: 5, fprk: 2, fpts: 398.5, avg: 49.8, last: 48.5 },
    // 3v3 Slots
    { slot: "3s", name: "Puffins CL", score: 45.5, opponent: "Flames CL", oprk: 1, fprk: 3, fpts: 385.0, avg: 48.1, last: 46.0 },
    { slot: "3s", name: "Eclipse ML", score: 44.0, opponent: "Torch ML", oprk: 3, fprk: 4, fpts: 372.5, avg: 46.6, last: 45.0 },
    // Flex Slot
    { slot: "FLX", name: "Vortex CL", score: 43.5, opponent: "Lightning DL", oprk: 6, fprk: 5, fpts: 368.0, avg: 46.0, last: 44.5 },
    // Bench
    { slot: "BE", name: "Lightning DL", score: 0, opponent: "Vortex CL", oprk: 4, fprk: 6, fpts: 356.0, avg: 44.5, last: 43.0 },
    { slot: "BE", name: "Phoenix ML", score: 0, opponent: "Storm CL", oprk: 8, fprk: 7, fpts: 342.5, avg: 42.8, last: 41.5 },
    { slot: "BE", name: "Storm CL", score: 0, opponent: "Phoenix ML", oprk: 7, fprk: 8, fpts: 335.0, avg: 41.9, last: 40.0 },
  ]
};

export default function MyRosterPage() {
  const roster = mockRoster;
  const [currentWeek, setCurrentWeek] = useState(roster.currentWeek);

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2rem", color: "var(--accent)" }}>Roster</h1>
      </div>

      {/* Thin Team Overview Box */}
      <section className="card" style={{ marginBottom: "1.5rem", padding: "1.5rem 2rem" }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "var(--text-main)"
        }}>
          {roster.teamName} • Record: <span style={{ color: "#22c55e", marginLeft: "0.5rem" }}>{roster.record.wins}</span>-<span style={{ color: "#ef4444" }}>{roster.record.losses}</span> • Rank: <span style={{ color: "var(--accent)", marginLeft: "0.5rem" }}>#{roster.rank}</span> • Total Points: <span style={{ color: "var(--accent)", marginLeft: "0.5rem" }}>{roster.totalPoints}</span>
        </div>
      </section>

      {/* Roster Table */}
      <section className="card">
        {/* Week Navigation and Actions */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}
              className="btn btn-ghost"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
            >
              ◀ Week {currentWeek - 1}
            </button>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
              This Week
            </span>
            <button
              onClick={() => setCurrentWeek(prev => prev + 1)}
              className="btn btn-ghost"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
            >
              Week {currentWeek + 1} ▶
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary" style={{ fontSize: "0.9rem" }}>
              ➕ Add
            </button>
            <button className="btn btn-ghost" style={{ fontSize: "0.9rem" }}>
              ➖ Drop
            </button>
          </div>
        </div>

        {/* Roster Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Slot</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Score</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Opp</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Oprk</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fprk</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fpts</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Last</th>
              </tr>
            </thead>
            <tbody>
              {roster.teams.map((team, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    backgroundColor: team.slot === "BE" ? "rgba(255,255,255,0.02)" : "transparent",
                    borderTop: team.slot === "BE" && index === 5 ? "2px solid rgba(255,255,255,0.15)" : "none"
                  }}
                >
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.9rem", color: team.slot === "BE" ? "var(--text-muted)" : "var(--accent)" }}>
                    {team.slot}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.95rem" }}>
                    {team.name || "-"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 700, fontSize: "1rem", color: team.score > 0 ? "var(--accent)" : "var(--text-muted)" }}>
                    {team.score > 0 ? team.score.toFixed(1) : "-"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {team.opponent || "-"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem" }}>
                    {team.oprk || "-"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", fontWeight: 600 }}>
                    {team.fprk || "-"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.95rem" }}>
                    {team.fpts ? team.fpts.toFixed(1) : "-"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {team.avg ? team.avg.toFixed(1) : "-"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {team.last ? team.last.toFixed(1) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
