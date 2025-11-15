"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { TEAMS, LEAGUE_COLORS } from "@/lib/teams";
import { LEAGUES } from "@/lib/leagues";
import TeamModal from "@/components/TeamModal";

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

  return (
    <>
      {/* Team Stats Modal */}
      <TeamModal team={showModal ? selectedTeam : null} onClose={() => setShowModal(false)} />

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
