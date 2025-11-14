"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import { TEAMS, LEAGUE_COLORS } from "@/lib/teams";
import { LEAGUES } from "@/lib/leagues";

type WeeklySortColumn = "week" | "fpts" | "avg" | "last" | "goals" | "shots" | "saves" | "assists" | "demos";
type SortDirection = "asc" | "desc";

// Generate weekly stats for modal
const generateWeeklyStats = (teamId: string) => {
  return Array.from({ length: 10 }, (_, i) => ({
    week: i + 1,
    opponent: TEAMS[Math.floor(Math.random() * TEAMS.length)].name,
    fpts: Math.floor(Math.random() * 25 + 30),
    avg: Math.floor(Math.random() * 20 + 35),
    last: Math.floor(Math.random() * 25 + 30),
    goals: Math.floor(Math.random() * 8 + 5),
    shots: Math.floor(Math.random() * 30 + 50),
    saves: Math.floor(Math.random() * 15 + 10),
    assists: Math.floor(Math.random() * 6 + 4),
    demos: Math.floor(Math.random() * 4 + 2),
    record: `${Math.floor(Math.random() * 2)}-${Math.floor(Math.random() * 2)}`,
  }));
};

// Mock data - replace with actual API calls when ready
const mockLeagues = [
  {
    id: "2025-alpha",
    name: "2025 RL Fantasy Alpha",
    season: 2025,
    currentWeek: 3,
    yourTeam: "Nick's Bumps",
    record: { wins: 2, losses: 1 },
    rank: 3,
    totalPoints: 425.5,
    lastMatchup: { opponent: "Rover's Rotators", score: "152.5 - 148.0", result: "W" }
  },
  {
    id: "2025-beta",
    name: "2025 RL Fantasy Beta",
    season: 2025,
    currentWeek: 3,
    yourTeam: "Air Dribble Demons",
    record: { wins: 1, losses: 2 },
    rank: 8,
    totalPoints: 380.0,
    lastMatchup: { opponent: "Flip Reset Kings", score: "135.0 - 145.5", result: "L" }
  },
  {
    id: "2024-championship",
    name: "2024 Championship League",
    season: 2024,
    currentWeek: 8,
    yourTeam: "Ceiling Shot Squad",
    record: { wins: 5, losses: 3 },
    rank: 4,
    totalPoints: 1150.0,
    lastMatchup: { opponent: "Musty Flick Masters", score: "165.5 - 152.0", result: "W" }
  }
];

// Mock global leaderboard - top performers across all leagues
const mockGlobalLeaderboard = [
  { rank: 1, manager: "FlipReset", team: "Ceiling Shot Squad", league: "2025 Alpha", wins: 7, losses: 1, winRate: 87.5, totalPoints: 1250.5, avgPoints: 156.3, isYou: false },
  { rank: 2, manager: "AirDribbler", team: "Musty Flick Masters", league: "2025 Beta", wins: 6, losses: 2, winRate: 75.0, totalPoints: 1180.0, avgPoints: 147.5, isYou: false },
  { rank: 3, manager: "Nick", team: "Nick's Bumps", league: "2025 Alpha", wins: 5, losses: 3, winRate: 62.5, totalPoints: 1150.0, avgPoints: 143.8, isYou: true },
  { rank: 4, manager: "SpeedDemon", team: "Boost Stealers", league: "2024 Championship", wins: 5, losses: 3, winRate: 62.5, totalPoints: 1120.5, avgPoints: 140.1, isYou: false },
  { rank: 5, manager: "Kuxir", team: "Pinch Masters", league: "2025 Alpha", wins: 4, losses: 4, winRate: 50.0, totalPoints: 1050.0, avgPoints: 131.3, isYou: false },
  { rank: 6, manager: "Squishy", team: "Double Tap Dynasty", league: "2025 Beta", wins: 4, losses: 4, winRate: 50.0, totalPoints: 1020.0, avgPoints: 127.5, isYou: false },
  { rank: 7, manager: "Jstn", team: "Zero Second Goals", league: "2024 Championship", wins: 3, losses: 5, winRate: 37.5, totalPoints: 980.5, avgPoints: 122.6, isYou: false },
  { rank: 8, manager: "Rover", team: "Air Dribble Demons", league: "2025 Beta", wins: 3, losses: 5, winRate: 37.5, totalPoints: 950.0, avgPoints: 118.8, isYou: false },
  { rank: 9, manager: "Garrett", team: "Flip Reset Kings", league: "2025 Alpha", wins: 2, losses: 6, winRate: 25.0, totalPoints: 890.0, avgPoints: 111.3, isYou: false },
  { rank: 10, manager: "Turbo", team: "Demo Destroyers", league: "2024 Championship", wins: 1, losses: 7, winRate: 12.5, totalPoints: 820.5, avgPoints: 102.6, isYou: false }
];

// Top performing teams - using actual MLE teams
const mockTopTeams = TEAMS.slice(0, 10).map((team, index) => ({
  ...team,
  rank: index + 1,
  tier: team.leagueId === "PL" ? "Premier" : team.leagueId === "ML" ? "Master" : team.leagueId === "CL" ? "Champion" : team.leagueId === "AL" ? "Academy" : "Foundation",
  division: team.leagueId,
  weekPoints: Math.floor(Math.random() * 10 + 36) + 0.5,
  totalPoints: Math.floor(Math.random() * 100 + 300) + 0.5,
  wins: Math.floor(Math.random() * 5 + 3),
  losses: Math.floor(Math.random() * 5 + 1),
  gameScore: 18 - index,
  ppg: Math.floor(Math.random() * 20 + 35) + 0.1,
  score:Math.floor(Math.random() * 25 + 30),
  fpts: Math.floor(Math.random() * 100 + 300),
  avg: Math.floor(Math.random() * 20 + 35),
  last: Math.floor(Math.random() * 25 + 30),
  goals: Math.floor(Math.random() * 50 + 100),
  shots: Math.floor(Math.random() * 200 + 600),
  saves: Math.floor(Math.random() * 100 + 150),
  assists: Math.floor(Math.random() * 40 + 60),
  demos: Math.floor(Math.random() * 30 + 30),
  record: `${Math.floor(Math.random() * 6 + 3)}-${Math.floor(Math.random() * 6 + 3)}`,
  status: "free-agent" as const
}));

export default function HomePage() {
  const [selectedTeam, setSelectedTeam] = useState<typeof mockTopTeams[0] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [weeklySortColumn, setWeeklySortColumn] = useState<WeeklySortColumn>("week");
  const [weeklySortDirection, setWeeklySortDirection] = useState<SortDirection>("asc");

  const handleWeeklySort = (column: WeeklySortColumn) => {
    if (weeklySortColumn === column) {
      setWeeklySortDirection(weeklySortDirection === "asc" ? "desc" : "asc");
    } else {
      setWeeklySortColumn(column);
      setWeeklySortDirection(column === "week" ? "asc" : "desc");
    }
  };

  const weeklyStats = useMemo(() => {
    if (!selectedTeam) return [];
    const stats = generateWeeklyStats(selectedTeam.id);
    return [...stats].sort((a, b) => {
      const aValue = a[weeklySortColumn];
      const bValue = b[weeklySortColumn];

      if (weeklySortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [selectedTeam, weeklySortColumn, weeklySortDirection]);

  const WeeklySortIcon = ({ column }: { column: WeeklySortColumn }) => {
    if (weeklySortColumn !== column) return null;
    return (
      <span style={{ marginLeft: "0.25rem" }}>
        {weeklySortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <>
      {/* Team Stats Modal */}
      {showModal && selectedTeam && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
              borderRadius: "12px",
              padding: "2rem",
              background: `linear-gradient(135deg, ${selectedTeam.teamPrimaryColor} 0%, ${selectedTeam.teamSecondaryColor} 100%)`,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
          >
            {/* Background Logo */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "400px",
                height: "400px",
                backgroundImage: `url(${selectedTeam.logoPath})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                opacity: 0.1,
                pointerEvents: "none",
                zIndex: 0
              }}
            />
            {/* Modal Header */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1.5rem",
              marginBottom: "2rem",
              paddingBottom: "1.5rem",
              borderBottom: "2px solid rgba(255,255,255,0.2)",
              position: "relative",
              zIndex: 1
            }}>
              <Image
                src={selectedTeam.logoPath}
                alt={`${selectedTeam.name} logo`}
                width={80}
                height={80}
                style={{ borderRadius: "8px" }}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: LEAGUE_COLORS[selectedTeam.leagueId as keyof typeof LEAGUE_COLORS] || "#ffffff",
                  margin: "0 0 0.5rem 0",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                }}>
                  {selectedTeam.leagueId} {selectedTeam.name}
                </h2>
                <div style={{
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.9)",
                  marginBottom: "0.75rem"
                }}>
                  {selectedTeam.record} · {selectedTeam.rank}{selectedTeam.rank === 1 ? 'st' : selectedTeam.rank === 2 ? 'nd' : selectedTeam.rank === 3 ? 'rd' : 'th'}
                </div>
                <div style={{
                  display: "flex",
                  gap: "2rem",
                  marginBottom: "0.75rem"
                }}>
                  <div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
                      {selectedTeam.fpts}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                      Fantasy Points
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
                      {selectedTeam.avg}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                      Avg Fantasy Points
                    </div>
                  </div>
                </div>
                <span style={{
                  display: "inline-block",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  backdropFilter: "blur(4px)"
                }}>
                  {selectedTeam.status === "free-agent" ? "Free Agent" : "On Waivers"}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  lineHeight: 1,
                  borderRadius: "4px",
                  backdropFilter: "blur(4px)"
                }}
              >
                ×
              </button>
            </div>

            {/* Weekly Stats Table */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: "1rem",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                Weekly Breakdown
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                      <th onClick={() => handleWeeklySort("week")} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Week<WeeklySortIcon column="week" /></th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Opponent</th>
                      <th onClick={() => handleWeeklySort("fpts")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Fpts<WeeklySortIcon column="fpts" /></th>
                      <th onClick={() => handleWeeklySort("avg")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Avg<WeeklySortIcon column="avg" /></th>
                      <th onClick={() => handleWeeklySort("last")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Last<WeeklySortIcon column="last" /></th>
                      <th onClick={() => handleWeeklySort("goals")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Goals<WeeklySortIcon column="goals" /></th>
                      <th onClick={() => handleWeeklySort("shots")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Shots<WeeklySortIcon column="shots" /></th>
                      <th onClick={() => handleWeeklySort("saves")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Saves<WeeklySortIcon column="saves" /></th>
                      <th onClick={() => handleWeeklySort("assists")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Assists<WeeklySortIcon column="assists" /></th>
                      <th onClick={() => handleWeeklySort("demos")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Demos<WeeklySortIcon column="demos" /></th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Record</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyStats.map((week) => (
                      <tr key={week.week} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#ffffff" }}>{week.week}</td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.opponent}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.9rem", color: "#ffffff" }}>{week.fpts}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>{week.avg}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>{week.last}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.goals}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.shots}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.saves}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.assists}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.demos}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>{week.record}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Header Section */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          padding: "1.5rem 0",
          borderBottom: "2px solid rgba(242, 182, 50, 0.2)"
        }}>
          {/* Left: Logo and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <img
              src="/mle-logo.png"
              alt="MLE Logo"
              style={{ width: "80px", height: "80px" }}
            />
            <div>
              <h1 style={{
                fontSize: "2.5rem",
                fontWeight: 900,
                marginBottom: "0.5rem",
                background: "linear-gradient(90deg, var(--mle-gold), #ffd700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.02em"
              }}>
                MLE FANTASY
              </h1>
              <p style={{
                fontSize: "1.3rem",
                fontFamily: "var(--font-zuume)",
                color: "var(--text-muted)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 600
              }}>
                Minor League Esports
              </p>
            </div>
          </div>

          {/* Right: Help Section */}
          <div style={{
            textAlign: "right",
            padding: "0.75rem 1rem",
            backgroundColor: "rgba(42, 75, 130, 0.2)",
            borderRadius: "12px",
            border: "1px solid rgba(242, 182, 50, 0.3)"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
              Need Help?
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--accent)" }}>
              Contact MLE Mailbox
            </div>
          </div>
        </div>

        {/* 80/20 Split Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "3.5fr 1fr", gap: "1rem" }}>
          {/* Global Leaderboard Section (80%) */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Manager Stats</h2>
              <span className="card-subtitle">Top 10 performers across all leagues</span>
            </div>

            <div style={{ marginTop: "1rem", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Manager</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>League</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>W-L</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Win %</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Total Pts</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {mockGlobalLeaderboard.map((player) => (
                    <tr
                      key={player.rank}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        backgroundColor: player.isYou ? "rgba(242, 182, 50, 0.08)" : "transparent",
                        borderLeft: player.isYou ? "3px solid var(--accent)" : "3px solid transparent"
                      }}
                    >
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 700, fontSize: "1rem", color: player.rank <= 3 ? "var(--accent)" : "inherit" }}>
                        {player.rank}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                        {player.manager}
                        {player.isYou && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "var(--accent)" }}>(You)</span>}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        {player.team}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {player.league}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: 500 }}>
                        <span style={{ color: "#22c55e" }}>{player.wins}</span>-<span style={{ color: "#ef4444" }}>{player.losses}</span>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: 600 }}>
                        {player.winRate.toFixed(0)}%
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "var(--accent)" }}>
                        {player.totalPoints.toFixed(1)}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "var(--text-muted)" }}>
                        {player.avgPoints.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Your Leagues Section (20%) */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Your League</h2>
            </div>

            {mockLeagues.length === 0 ? (
              <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No leagues yet
              </p>
            ) : (
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {mockLeagues.map((league) => (
                  <Link
                    key={league.id}
                    href={`/leagues/${league.id}`}
                    className="btn btn-ghost"
                    style={{
                      textDecoration: "none",
                      justifyContent: "flex-start",
                      padding: "0.75rem 1rem",
                      fontSize: "0.95rem",
                      fontWeight: 600
                    }}
                  >
                    {league.name}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Team Stats Section */}
        <section className="card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <h2 className="card-title">Team Stats</h2>
            <span className="card-subtitle">Top 10 performing MLE teams</span>
          </div>

          <div style={{ marginTop: "1rem", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Score</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fpts</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Last</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Shots</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Goals</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Assists</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Saves</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Demos</th>
                </tr>
              </thead>
              <tbody>
                {mockTopTeams.map((team) => (
                  <tr
                    key={team.rank}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: 700, fontSize: "1rem", color: team.rank <= 3 ? "var(--accent)" : "inherit" }}>
                      {team.rank}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Image
                          src={team.logoPath}
                          alt={`${team.name} logo`}
                          width={24}
                          height={24}
                          style={{ borderRadius: "4px" }}
                        />
                        <span
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowModal(true);
                          }}
                          style={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            color: "var(--text-main)",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                        >
                          {team.leagueId} {team.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "var(--accent)" }}>
                      {team.score}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600 }}>
                      {team.fpts}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "var(--text-muted)" }}>
                      {team.last}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "var(--text-muted)" }}>
                      {team.avg}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                      {team.shots}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                      {team.goals}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                      {team.assists}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                      {team.saves}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                      {team.demos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
