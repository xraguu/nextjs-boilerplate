"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";

// Mock standings data with top performing team
const mockStandings = [
  {
    rank: 1,
    manager: "FlipReset",
    team: "Ceiling Shot Squad",
    wins: 7,
    losses: 1,
    points: 1250.5,
    avgPoints: 156.3,
    topTeam: TEAMS[0],
    topTeamFpts: 425.5,
    pointsFor: 1250.5,
    pointsAgainst: 980.2,
    streak: "W3"
  },
  {
    rank: 2,
    manager: "AirDribbler",
    team: "Musty Flick Masters",
    wins: 6,
    losses: 2,
    points: 1180.0,
    avgPoints: 147.5,
    topTeam: TEAMS[1],
    topTeamFpts: 398.2,
    pointsFor: 1180.0,
    pointsAgainst: 1020.5,
    streak: "W2"
  },
  {
    rank: 3,
    manager: "Nick",
    team: "Nick's Bumps",
    wins: 5,
    losses: 3,
    points: 1150.0,
    avgPoints: 143.8,
    isYou: true,
    topTeam: TEAMS[2],
    topTeamFpts: 412.3,
    pointsFor: 1150.0,
    pointsAgainst: 1050.8,
    streak: "L1"
  },
  {
    rank: 4,
    manager: "SpeedDemon",
    team: "Boost Stealers",
    wins: 5,
    losses: 3,
    points: 1120.5,
    avgPoints: 140.1,
    topTeam: TEAMS[3],
    topTeamFpts: 389.1,
    pointsFor: 1120.5,
    pointsAgainst: 1090.3,
    streak: "W1"
  },
  {
    rank: 5,
    manager: "Kuxir",
    team: "Pinch Masters",
    wins: 4,
    losses: 4,
    points: 1050.0,
    avgPoints: 131.3,
    topTeam: TEAMS[4],
    topTeamFpts: 375.8,
    pointsFor: 1050.0,
    pointsAgainst: 1050.0,
    streak: "L2"
  },
  {
    rank: 6,
    manager: "Squishy",
    team: "Double Tap Dynasty",
    wins: 4,
    losses: 4,
    points: 1020.0,
    avgPoints: 127.5,
    topTeam: TEAMS[5],
    topTeamFpts: 362.4,
    pointsFor: 1020.0,
    pointsAgainst: 1080.5,
    streak: "W1"
  },
  {
    rank: 7,
    manager: "Jstn",
    team: "Zero Second Goals",
    wins: 3,
    losses: 5,
    points: 980.5,
    avgPoints: 122.6,
    topTeam: TEAMS[6],
    topTeamFpts: 355.2,
    pointsFor: 980.5,
    pointsAgainst: 1120.7,
    streak: "L1"
  },
  {
    rank: 8,
    manager: "Rover",
    team: "Air Dribble Demons",
    wins: 3,
    losses: 5,
    points: 950.0,
    avgPoints: 118.8,
    topTeam: TEAMS[7],
    topTeamFpts: 348.6,
    pointsFor: 950.0,
    pointsAgainst: 1150.2,
    streak: "L3"
  },
  {
    rank: 9,
    manager: "Garrett",
    team: "Flip Reset Kings",
    wins: 2,
    losses: 6,
    points: 890.0,
    avgPoints: 111.3,
    topTeam: TEAMS[8],
    topTeamFpts: 332.1,
    pointsFor: 890.0,
    pointsAgainst: 1180.5,
    streak: "L4"
  },
  {
    rank: 10,
    manager: "Turbo",
    team: "Demo Destroyers",
    wins: 1,
    losses: 7,
    points: 820.5,
    avgPoints: 102.6,
    topTeam: TEAMS[9],
    topTeamFpts: 315.8,
    pointsFor: 820.5,
    pointsAgainst: 1220.3,
    streak: "L5"
  }
];

export default function StandingsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.LeagueID as string;
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

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
                <>
                  <tr
                    key={team.rank}
                    style={{
                      borderBottom: team.rank === 4 ? "2px dotted var(--accent)" : "1px solid rgba(255,255,255,0.05)",
                      backgroundColor: team.isYou ? "rgba(242, 182, 50, 0.08)" : "transparent",
                      borderLeft: team.isYou ? "3px solid var(--accent)" : "3px solid transparent",
                      cursor: "pointer"
                    }}
                    onClick={() => setExpandedRow(expandedRow === team.rank ? null : team.rank)}
                  >
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: team.rank <= 4 ? "var(--accent)" : "inherit" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{
                          fontSize: "0.85rem",
                          transition: "transform 0.2s",
                          transform: expandedRow === team.rank ? "rotate(90deg)" : "rotate(0deg)",
                          display: "inline-block"
                        }}>
                          ▶
                        </span>
                        {team.rank}
                      </div>
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

                {/* Expanded Details Row */}
                {expandedRow === team.rank && (
                  <tr style={{ backgroundColor: team.isYou ? "rgba(242, 182, 50, 0.05)" : "rgba(255,255,255,0.02)" }}>
                    <td colSpan={6} style={{ padding: "1.5rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        {/* Left Side - Top Performing Team */}
                        <div>
                          <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Top Performing Team
                          </h4>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "1rem",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.1)"
                          }}>
                            <Image
                              src={team.topTeam.logoPath}
                              alt={team.topTeam.name}
                              width={48}
                              height={48}
                              style={{ borderRadius: "6px" }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                                {team.topTeam.leagueId} {team.topTeam.name}
                              </div>
                              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                                {team.topTeamFpts.toFixed(1)} Total Points
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Additional Stats */}
                        <div>
                          <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Manager Stats
                          </h4>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div style={{
                              padding: "1rem",
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: "8px",
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Points For</div>
                              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>{team.pointsFor.toFixed(1)}</div>
                            </div>
                            <div style={{
                              padding: "1rem",
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: "8px",
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Points Against</div>
                              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>{team.pointsAgainst.toFixed(1)}</div>
                            </div>
                            <div style={{
                              padding: "1rem",
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: "8px",
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Avg Points</div>
                              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>{team.avgPoints.toFixed(1)}</div>
                            </div>
                            <div style={{
                              padding: "1rem",
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: "8px",
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Streak</div>
                              <div style={{
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                color: team.streak.startsWith("W") ? "#22c55e" : "#ef4444"
                              }}>
                                {team.streak}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
