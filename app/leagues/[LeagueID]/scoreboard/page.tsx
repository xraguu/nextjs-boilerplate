"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { TEAMS, LEAGUE_COLORS } from "@/lib/teams";

// Generate weekly stats for modal
const generateWeeklyStats = (teamName: string) => {
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

// Mock player data for rosters
const generatePlayers = (leagueId: string, count: number) => {
  const leagueTeams = TEAMS.filter(t => t.leagueId === leagueId);
  return Array.from({ length: count }, (_, i) => {
    const team = leagueTeams[Math.floor(Math.random() * leagueTeams.length)];
    const positions = ["2s", "2s", "3s", "3s", "FLX", "BE", "BE", "BE"];
    return {
      id: `player-${i}`,
      name: team.name,
      team: team,
      position: positions[i] || "BE",
      points: i < 5 ? Math.floor(Math.random() * 20 + 35) : 0,
      opponent: leagueTeams[Math.floor(Math.random() * leagueTeams.length)],
      opponentRank: Math.floor(Math.random() * 16 + 1),
      hasPlayed: i < 5
    };
  });
};

// Mock matchup data
const generateMatchups = (week: number) => {
  return [
    {
      id: 1,
      week,
      team1: {
        managerName: "xenn",
        teamName: "Fantastic Ballers",
        record: "2-1",
        standing: "3rd",
        score: 198,
        roster: generatePlayers("AL", 8)
      },
      team2: {
        managerName: "Crazy",
        teamName: "Pixies",
        record: "0-3",
        standing: "9th",
        score: 198,
        roster: generatePlayers("PL", 8)
      }
    },
    {
      id: 2,
      week,
      team1: {
        managerName: "Mike",
        teamName: "Thunder Strikers",
        record: "3-0",
        standing: "1st",
        score: 205,
        roster: generatePlayers("AL", 8)
      },
      team2: {
        managerName: "Sarah",
        teamName: "Ice Warriors",
        record: "1-2",
        standing: "7th",
        score: 187,
        roster: generatePlayers("FL", 8)
      }
    },
    {
      id: 3,
      week,
      team1: {
        managerName: "Jake",
        teamName: "Fire Dragons",
        record: "2-1",
        standing: "4th",
        score: 192,
        roster: generatePlayers("AL", 8)
      },
      team2: {
        managerName: "Emma",
        teamName: "Sky Hunters",
        record: "2-1",
        standing: "5th",
        score: 189,
        roster: generatePlayers("PL", 8)
      }
    },
    {
      id: 4,
      week,
      team1: {
        managerName: "Alex",
        teamName: "Storm Chasers",
        record: "2-1",
        standing: "6th",
        score: 201,
        roster: generatePlayers("CL", 8)
      },
      team2: {
        managerName: "Jordan",
        teamName: "Lightning Bolts",
        record: "1-2",
        standing: "8th",
        score: 195,
        roster: generatePlayers("ML", 8)
      }
    },
    {
      id: 5,
      week,
      team1: {
        managerName: "Taylor",
        teamName: "Phoenix Rising",
        record: "3-0",
        standing: "2nd",
        score: 210,
        roster: generatePlayers("FL", 8)
      },
      team2: {
        managerName: "Casey",
        teamName: "Thunder Wolves",
        record: "0-3",
        standing: "11th",
        score: 178,
        roster: generatePlayers("PL", 8)
      }
    },
    {
      id: 6,
      week,
      team1: {
        managerName: "Morgan",
        teamName: "Ice Breakers",
        record: "1-2",
        standing: "10th",
        score: 185,
        roster: generatePlayers("AL", 8)
      },
      team2: {
        managerName: "Riley",
        teamName: "Fire Hawks",
        record: "2-1",
        standing: "12th",
        score: 183,
        roster: generatePlayers("CL", 8)
      }
    }
  ];
};

export default function ScoreboardPage() {
  const [currentWeek, setCurrentWeek] = useState(3);
  const [selectedMatchup, setSelectedMatchup] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [weeklySortColumn, setWeeklySortColumn] = useState<WeeklySortColumn>("week");
  const [weeklySortDirection, setWeeklySortDirection] = useState<SortDirection>("asc");

  const matchups = generateMatchups(currentWeek);
  const selectedMatch = matchups.find(m => m.id === selectedMatchup);

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
    const stats = generateWeeklyStats(selectedTeam.name);
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

  const openTeamModal = (player: any) => {
    setSelectedTeam({
      ...player.team,
      fpts: 425,
      avg: 53,
      last: 52,
      rank: Math.floor(Math.random() * 10 + 1),
      record: "8-2",
      status: "free-agent"
    });
    setShowModal(true);
  };

  const getTopPerformers = (roster: any[]) => {
    return roster
      .filter(p => p.hasPlayed)
      .sort((a, b) => b.points - a.points)
      .slice(0, 2);
  };

  const getToPlayCount = (roster: any[]) => {
    return roster.filter(p => !p.hasPlayed).length;
  };

  const getTeamColor = (team1Score: number, team2Score: number, isTeam1: boolean) => {
    if (team1Score === team2Score) return "#ffffff"; // Tie - white
    if (isTeam1) {
      return team1Score > team2Score ? "#d4af37" : "#808080"; // Gold if winning, gray if losing
    } else {
      return team2Score > team1Score ? "#d4af37" : "#808080"; // Gold if winning, gray if losing
    }
  };

  if (selectedMatch) {
    // Matchup Detail View
    const toPlay1 = getToPlayCount(selectedMatch.team1.roster);
    const toPlay2 = getToPlayCount(selectedMatch.team2.roster);
    const total1 = selectedMatch.team1.roster.length;
    const total2 = selectedMatch.team2.roster.length;

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


        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => setSelectedMatchup(null)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#ffffff",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              marginBottom: "1rem"
            }}
          >
            ← Back to Scoreboard
          </button>
          <h1 className="page-heading" style={{ color: "#d4af37" }}>Matchup</h1>
        </div>

        <section style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: "12px",
          padding: "2rem",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          {/* Team Headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "3rem",
            alignItems: "start",
            marginBottom: "2rem",
            paddingBottom: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            {/* Team 1 */}
            <div>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: getTeamColor(selectedMatch.team1.score, selectedMatch.team2.score, true),
                marginBottom: "0.25rem"
              }}>
                {selectedMatch.team1.teamName}
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                margin: 0
              }}>
                {selectedMatch.team1.managerName}
              </p>
              <p style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.85rem",
                margin: 0
              }}>
                {selectedMatch.team1.record} {selectedMatch.team1.standing}
              </p>

              {/* Progress Bar */}
              <div style={{ marginTop: "1rem" }}>
                <div style={{
                  height: "30px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "15px",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <div style={{
                    width: `${((total1 - toPlay1) / total1) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #4CAF50 0%, #45a049 100%)",
                    transition: "width 0.3s ease"
                  }} />
                  <span style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#ffffff",
                    fontSize: "0.8rem",
                    fontWeight: 600
                  }}>
                    To Play: {toPlay1}
                  </span>
                </div>
              </div>
            </div>

            {/* Scores with VS */}
            <div style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{
                fontSize: "4rem",
                fontWeight: 700,
                color: getTeamColor(selectedMatch.team1.score, selectedMatch.team2.score, true)
              }}>
                {selectedMatch.team1.score}
              </span>
              <span style={{
                fontSize: "1.2rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.6)",
                marginTop: "0.5rem"
              }}>
                vs.
              </span>
              <span style={{
                fontSize: "4rem",
                fontWeight: 700,
                color: getTeamColor(selectedMatch.team1.score, selectedMatch.team2.score, false)
              }}>
                {selectedMatch.team2.score}
              </span>
            </div>

            {/* Team 2 */}
            <div style={{ textAlign: "right" }}>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: getTeamColor(selectedMatch.team1.score, selectedMatch.team2.score, false),
                marginBottom: "0.25rem"
              }}>
                {selectedMatch.team2.teamName}
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                margin: 0
              }}>
                {selectedMatch.team2.managerName}
              </p>
              <p style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.85rem",
                margin: 0
              }}>
                {selectedMatch.team2.record} {selectedMatch.team2.standing}
              </p>

              {/* Progress Bar */}
              <div style={{ marginTop: "1rem" }}>
                <div style={{
                  height: "30px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "15px",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <div style={{
                    width: `${((total2 - toPlay2) / total2) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #4CAF50 0%, #45a049 100%)",
                    transition: "width 0.3s ease"
                  }} />
                  <span style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#ffffff",
                    fontSize: "0.8rem",
                    fontWeight: 600
                  }}>
                    To Play: {toPlay2}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Roster Breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {selectedMatch.team1.roster.map((player1, idx) => {
              const player2 = selectedMatch.team2.roster[idx];
              return (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr auto 1fr 2fr",
                    gap: "1rem",
                    alignItems: "center",
                    padding: "0.75rem 1rem",
                    background: idx % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent",
                    borderRadius: "6px"
                  }}
                >
                  {/* Team 1 Player */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Image
                      src={player1.team.logoPath}
                      alt={player1.name}
                      width={30}
                      height={30}
                      style={{ borderRadius: "4px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        onClick={() => openTeamModal(player1)}
                        style={{ color: "#ffffff", fontSize: "0.95rem", fontWeight: 500, cursor: "pointer", textDecoration: "underline" }}>
                        {player1.name}
                      </div>
                      {player1.hasPlayed && (
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                          vs. {player1.opponent.name} ({player1.opponentRank}{player1.opponentRank === 1 ? 'st' : player1.opponentRank === 2 ? 'nd' : player1.opponentRank === 3 ? 'rd' : 'th'})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team 1 Points */}
                  <div style={{
                    color: "#d4af37",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    textAlign: "right"
                  }}>
                    {player1.points}
                  </div>

                  {/* Position */}
                  <div style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    minWidth: "50px",
                    textAlign: "center"
                  }}>
                    {player1.position}
                  </div>

                  {/* Team 2 Points */}
                  <div style={{
                    color: "#d4af37",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    textAlign: "left"
                  }}>
                    {player2.points}
                  </div>

                  {/* Team 2 Player */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "flex-end" }}>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <div
                        onClick={() => openTeamModal(player2)}
                        style={{ color: "#ffffff", fontSize: "0.95rem", fontWeight: 500, cursor: "pointer", textDecoration: "underline" }}>
                        {player2.name}
                      </div>
                      {player2.hasPlayed && (
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                          vs. {player2.opponent.name} ({player2.opponentRank}{player2.opponentRank === 1 ? 'st' : player2.opponentRank === 2 ? 'nd' : player2.opponentRank === 3 ? 'rd' : 'th'})
                        </div>
                      )}
                    </div>
                    <Image
                      src={player2.team.logoPath}
                      alt={player2.name}
                      width={30}
                      height={30}
                      style={{ borderRadius: "4px" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </>
    );
  }

  // Scoreboard View
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


      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem"
      }}>
        <h1 className="page-heading" style={{ color: "#d4af37", margin: 0 }}>Scoreboard</h1>

        {/* Week Navigation */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <button
            onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
            disabled={currentWeek === 1}
            style={{
              background: "transparent",
              border: "none",
              color: currentWeek === 1 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
              cursor: currentWeek === 1 ? "not-allowed" : "pointer",
              fontSize: "1rem"
            }}
          >
            ◄ Week {currentWeek - 1}
          </button>

          <span style={{
            color: "#d4af37",
            fontSize: "1.1rem",
            fontWeight: 600,
            padding: "0 1rem"
          }}>
            Week {currentWeek}
          </span>

          <button
            onClick={() => setCurrentWeek(currentWeek + 1)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Week {currentWeek + 1} ►
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {matchups.map((matchup) => {
          const team1TopPerformers = getTopPerformers(matchup.team1.roster);
          const team2TopPerformers = getTopPerformers(matchup.team2.roster);

          return (
            <section
              key={matchup.id}
              style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "grid",
                gridTemplateColumns: "auto 1px 1fr auto",
                gap: "1.5rem",
                alignItems: "center",
                padding: "1.5rem"
              }}
            >
              {/* Left Side - Teams and Scores */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "250px" }}>
                {/* Team 1 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: getTeamColor(matchup.team1.score, matchup.team2.score, true),
                      marginBottom: "0.25rem"
                    }}>
                      {matchup.team1.teamName}
                    </h2>
                    <p style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.8rem",
                      margin: 0
                    }}>
                      {matchup.team1.managerName} {matchup.team1.record} {matchup.team1.standing}
                    </p>
                  </div>
                  <div style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: getTeamColor(matchup.team1.score, matchup.team2.score, true),
                    marginLeft: "2rem"
                  }}>
                    {matchup.team1.score}
                  </div>
                </div>

                {/* Team 2 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: getTeamColor(matchup.team1.score, matchup.team2.score, false),
                      marginBottom: "0.25rem"
                    }}>
                      {matchup.team2.teamName}
                    </h2>
                    <p style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.8rem",
                      margin: 0
                    }}>
                      {matchup.team2.managerName} {matchup.team2.record} {matchup.team2.standing}
                    </p>
                  </div>
                  <div style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: getTeamColor(matchup.team1.score, matchup.team2.score, false),
                    marginLeft: "2rem"
                  }}>
                    {matchup.team2.score}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                width: "1px",
                background: "rgba(255,255,255,0.2)",
                height: "100%",
                minHeight: "120px"
              }} />

              {/* Right Side - Top Performers */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                {/* Team 1 Top Performers */}
                <div>
                  <div style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.75rem",
                    marginBottom: "0.5rem",
                    fontWeight: 600
                  }}>
                    Top performers
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    {team1TopPerformers.map((player, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flex: 1
                        }}
                      >
                        <Image
                          src={player.team.logoPath}
                          alt={player.name}
                          width={20}
                          height={20}
                          style={{ borderRadius: "4px" }}
                        />
                        <span style={{
                          color: "#ffffff",
                          fontSize: "0.85rem"
                        }}>
                          {player.team.leagueId} {player.name}
                        </span>
                        <span style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.7rem"
                        }}>
                          {player.position}
                        </span>
                        <span style={{
                          color: LEAGUE_COLORS[player.team.leagueId] || "#4da6ff",
                          fontSize: "0.9rem",
                          fontWeight: 600
                        }}>
                          {player.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team 2 Top Performers */}
                <div>
                  <div style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.75rem",
                    marginBottom: "0.5rem",
                    fontWeight: 600
                  }}>
                    Top performers
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    {team2TopPerformers.map((player, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flex: 1
                        }}
                      >
                        <Image
                          src={player.team.logoPath}
                          alt={player.name}
                          width={20}
                          height={20}
                          style={{ borderRadius: "4px" }}
                        />
                        <span style={{
                          color: "#ffffff",
                          fontSize: "0.85rem"
                        }}>
                          {player.team.leagueId} {player.name}
                        </span>
                        <span style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.7rem"
                        }}>
                          {player.position}
                        </span>
                        <span style={{
                          color: LEAGUE_COLORS[player.team.leagueId] || "#4da6ff",
                          fontSize: "0.9rem",
                          fontWeight: 600
                        }}>
                          {player.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matchup Button */}
              <div>
                <button
                  onClick={() => setSelectedMatchup(matchup.id)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff",
                    padding: "0.75rem 2rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  }}
                >
                  Matchup
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
