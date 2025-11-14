"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { TEAMS, LEAGUE_COLORS } from "@/lib/teams";

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

type WeeklySortColumn = "week" | "fpts" | "avg" | "last" | "goals" | "shots" | "saves" | "assists" | "demos";
type SortDirection = "asc" | "desc";

// Select 8 random teams from TEAMS with stats
const selectedTeams = TEAMS.slice(0, 8).map((team, index) => ({
  ...team,
  slot: index < 2 ? "2s" : index < 4 ? "3s" : index === 4 ? "FLX" : "BE",
  score: index < 5 ? Math.floor(Math.random() * 10 + 40) : 0,
  opponentTeam: TEAMS[Math.floor(Math.random() * TEAMS.length)],
  oprk: Math.floor(Math.random() * 10 + 1),
  fprk: index + 1,
  fpts: Math.floor(Math.random() * 100 + 300),
  avg: Math.floor(Math.random() * 20 + 35),
  last: Math.floor(Math.random() * 25 + 30),
  goals: Math.floor(Math.random() * 50 + 100),
  shots: Math.floor(Math.random() * 200 + 600),
  saves: Math.floor(Math.random() * 100 + 150),
  assists: Math.floor(Math.random() * 40 + 60),
  demos: Math.floor(Math.random() * 30 + 30),
  teamRecord: `${Math.floor(Math.random() * 6 + 3)}-${Math.floor(Math.random() * 6 + 3)}`,
  rank: index + 1,
  record: `${Math.floor(Math.random() * 6 + 3)}-${Math.floor(Math.random() * 6 + 3)}`,
  status: "free-agent" as const
}));

// Mock roster data with full stats
const mockRoster = {
  managerName: "xenn",
  teamName: "Fantastic Ballers",
  record: { wins: 2, losses: 1, place: "3rd" },
  totalPoints: 543,
  avgPoints: 181,
  currentWeek: 3,
  lastMatchup: {
    myTeam: "Fantastic Ballers",
    myScore: 157,
    opponent: "Pixies",
    opponentScore: 142
  },
  currentMatchup: {
    myTeam: "Fantastic Ballers",
    myScore: 169,
    opponent: "Whiffers",
    opponentScore: 135
  },
  teams: selectedTeams
};

export default function MyRosterPage() {
  const roster = mockRoster;
  const [currentWeek, setCurrentWeek] = useState(roster.currentWeek);
  const [activeTab, setActiveTab] = useState<"lineup" | "stats">("lineup");
  const [selectedTeam, setSelectedTeam] = useState<typeof selectedTeams[0] | null>(null);
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
            alignments: "center",
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
                  color: "#ffffff",
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

      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>Roster</h1>
      </div>

      {/* Team Overview Card */}
      <section className="card" style={{
        marginBottom: "1.5rem",
        padding: "1.5rem 2rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Team Info */}
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", marginTop: 0 }}>
              {roster.teamName}{" "}
              <span style={{ color: "var(--accent)", marginLeft: "0.75rem" }}>
                {roster.record.wins}-{roster.record.losses}
              </span>{" "}
              <span style={{ color: "var(--text-muted)", fontSize: "1.2rem", marginLeft: "0.5rem" }}>
                {roster.record.place}
              </span>
            </h2>
            <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{roster.managerName}</div>
            <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{roster.totalPoints} Fantasy Points</span>
              <span style={{ color: "var(--text-muted)", marginLeft: "1.5rem" }}>{roster.avgPoints} Avg Fantasy Points</span>
            </div>
          </div>

          {/* Matchup Info */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {/* Last Matchup */}
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", marginBottom: "0.5rem" }}>
                Last Matchup
              </div>
              <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-main)" }}>{roster.lastMatchup.myTeam}</span>{" "}
                <span style={{ color: "var(--accent)", fontWeight: 700, marginLeft: "0.5rem" }}>
                  {roster.lastMatchup.myScore}
                </span>
              </div>
              <div style={{ fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{roster.lastMatchup.opponent}</span>{" "}
                <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  {roster.lastMatchup.opponentScore}
                </span>
              </div>
            </div>

            <div style={{ width: "1px", height: "60px", backgroundColor: "rgba(255,255,255,0.1)" }}></div>

            {/* Current Matchup */}
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", marginBottom: "0.5rem" }}>
                Current Matchup
              </div>
              <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-main)" }}>{roster.currentMatchup.myTeam}</span>{" "}
                <span style={{ color: "var(--accent)", fontWeight: 700, marginLeft: "0.5rem" }}>
                  {roster.currentMatchup.myScore}
                </span>
              </div>
              <div style={{ fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{roster.currentMatchup.opponent}</span>{" "}
                <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  {roster.currentMatchup.opponentScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveTab("lineup")}
          className={activeTab === "lineup" ? "btn btn-primary" : "btn btn-ghost"}
          style={{ fontSize: "1rem" }}
        >
          Lineup
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={activeTab === "stats" ? "btn btn-primary" : "btn btn-ghost"}
          style={{ fontSize: "1rem" }}
        >
          Stats
        </button>
      </div>

      {/* Lineup Tab */}
      {activeTab === "lineup" && (
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
                ◄ Week {currentWeek - 1}
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                Week {currentWeek}
              </span>
              <button
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                Week {currentWeek + 1} ►
              </button>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-primary" style={{ fontSize: "0.9rem" }}>
                + Add
              </button>
              <button className="btn btn-ghost" style={{ fontSize: "0.9rem" }}>
                - Drop
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
                    <td style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: team.slot === "BE" ? "var(--text-muted)" : "var(--accent)"
                    }}>
                      {team.slot}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
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
                    <td style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: team.score > 0 ? "var(--accent)" : "var(--text-muted)"
                    }}>
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
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <section className="card">
          {/* Week Navigation */}
          <div style={{
            display: "flex",
            justifyContent: "center",
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
                ◄ Week {currentWeek - 1}
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                Week {currentWeek}
              </span>
              <button
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                Week {currentWeek + 1} ►
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Score</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fprk</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fpts</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Last</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Goals</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Shots</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Saves</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Assists</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Demos</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                </tr>
              </thead>
              <tbody>
                {roster.teams
                  .sort((a, b) => a.fprk - b.fprk)
                  .map((team, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)"
                      }}
                    >
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)" }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
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
                      <td style={{
                        padding: "0.75rem 1rem",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "var(--accent)"
                      }}>
                        {team.score > 0 ? team.score.toFixed(1) : "-"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", fontWeight: 600 }}>
                        {team.fprk}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.95rem" }}>
                        {team.fpts.toFixed(1)}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        {team.avg.toFixed(1)}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        {team.last.toFixed(1)}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.goals}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.shots}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.saves}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.assists}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.demos}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        {team.teamRecord}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
