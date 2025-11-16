"use client";

import { useParams, useRouter } from "next/navigation";

// Mock standings data
const mockStandings = [
  { rank: 1, manager: "FlipReset", team: "Ceiling Shot Squad", wins: 7, losses: 1, points: 1250.5, avgPoints: 156.3 },
  { rank: 2, manager: "AirDribbler", team: "Musty Flick Masters", wins: 6, losses: 2, points: 1180.0, avgPoints: 147.5 },
  { rank: 3, manager: "Nick", team: "Nick's Bumps", wins: 5, losses: 3, points: 1150.0, avgPoints: 143.8, isYou: true },
  { rank: 4, manager: "SpeedDemon", team: "Boost Stealers", wins: 5, losses: 3, points: 1120.5, avgPoints: 140.1 },
  { rank: 5, manager: "Kuxir", team: "Pinch Masters", wins: 4, losses: 4, points: 1050.0, avgPoints: 131.3 },
  { rank: 6, manager: "Squishy", team: "Double Tap Dynasty", wins: 4, losses: 4, points: 1020.0, avgPoints: 127.5 },
  { rank: 7, manager: "Jstn", team: "Zero Second Goals", wins: 3, losses: 5, points: 980.5, avgPoints: 122.6 },
  { rank: 8, manager: "Rover", team: "Air Dribble Demons", wins: 3, losses: 5, points: 950.0, avgPoints: 118.8 },
  { rank: 9, manager: "Garrett", team: "Flip Reset Kings", wins: 2, losses: 6, points: 890.0, avgPoints: 111.3 },
  { rank: 10, manager: "Turbo", team: "Demo Destroyers", wins: 1, losses: 7, points: 820.5, avgPoints: 102.6 }
];

export default function StandingsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.LeagueID as string;

  const handleManagerClick = (managerName: string) => {
    router.push(`/leagues/${leagueId}/opponents?manager=${encodeURIComponent(managerName)}`);
  };

  const handlePlayoffsClick = () => {
    router.push(`/leagues/${leagueId}/standings/playoffs`);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>Standings</h1>
        <button
          onClick={handlePlayoffsClick}
          style={{
            backgroundColor: "var(--accent)",
            color: "#1a1a2e",
            padding: "0.5rem 1.5rem",
            borderRadius: "2rem",
            fontWeight: 700,
            fontSize: "1rem",
            border: "none",
            cursor: "pointer"
          }}
        >
          Playoffs
        </button>
      </div>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">League Standings</h2>
          <span className="card-pill">Week 8</span>
        </div>

        <div style={{ marginTop: "1rem", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Manager</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>W-L</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Points</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg</th>
              </tr>
            </thead>
            <tbody>
              {mockStandings.map((team) => (
                <tr
                  key={team.rank}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    backgroundColor: team.isYou ? "rgba(242, 182, 50, 0.08)" : "transparent",
                    borderLeft: team.isYou ? "3px solid var(--accent)" : "3px solid transparent"
                  }}
                >
                  <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: team.rank <= 3 ? "var(--accent)" : "inherit" }}>
                    {team.rank}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <span
                      onClick={() => handleManagerClick(team.manager)}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                      style={{
                        cursor: "pointer",
                        color: "var(--text-main)",
                        transition: "color 0.2s"
                      }}
                    >
                      {team.manager}
                    </span>
                    {team.isYou && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "var(--accent)" }}>(You)</span>}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)" }}>
                    <span
                      onClick={() => handleManagerClick(team.manager)}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                      style={{
                        cursor: "pointer",
                        transition: "color 0.2s"
                      }}
                    >
                      {team.team}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: 500 }}>
                    <span style={{ color: "#22c55e" }}>{team.wins}</span>-<span style={{ color: "#ef4444" }}>{team.losses}</span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600 }}>
                    {team.points.toFixed(1)}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "var(--text-muted)" }}>
                    {team.avgPoints.toFixed(1)}
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
