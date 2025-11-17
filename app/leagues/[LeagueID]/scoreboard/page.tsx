"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TEAMS, LEAGUE_COLORS } from "@/lib/teams";
import TeamModal from "@/components/TeamModal";

// Helper function to get fantasy rank color
const getFantasyRankColor = (rank: number): string => {
  if (rank >= 1 && rank <= 12) return "#ef4444"; // red
  if (rank >= 13 && rank <= 24) return "#9ca3af"; // gray
  if (rank >= 25 && rank <= 32) return "#22c55e"; // green
  return "#9ca3af"; // default gray
};

// Mock player data for rosters
// Static values to prevent hydration errors (no Math.random())
const generatePlayers = (leagueId: string, count: number) => {
  const leagueTeams = TEAMS.filter(t => t.leagueId === leagueId);
  const opponentGameRecords = ["10-15", "8-17", "12-10", "5-18", "7-15", "9-13", "11-11", "6-16"];
  const opponentFantasyRanks = [1, 18, 5, 28, 14, 8, 10, 26];

  return Array.from({ length: count }, (_, i) => {
    const team = leagueTeams[i % leagueTeams.length];
    const positions = ["2s", "2s", "3s", "3s", "FLX", "BE", "BE", "BE"];
    return {
      id: `player-${i}`,
      name: team.name,
      team: team,
      position: positions[i] || "BE",
      points: i < 5 ? (50 - i * 3) : 0,
      opponent: leagueTeams[(i * 3) % leagueTeams.length],
      opponentRank: opponentFantasyRanks[i % opponentFantasyRanks.length],
      opponentGameRecord: opponentGameRecords[i % opponentGameRecords.length],
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
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leagueId = params.LeagueID as string;

  const [currentWeek, setCurrentWeek] = useState(() => {
    const weekParam = searchParams.get('week');
    if (weekParam) {
      const weekNum = parseInt(weekParam);
      if (!isNaN(weekNum) && weekNum >= 1 && weekNum <= 10) {
        return weekNum;
      }
    }
    return 3;
  });

  // Helper functions for week navigation (weeks 1-10)
  const getNextWeek = (week: number) => {
    if (week >= 10) return 10;
    return week + 1;
  };

  const getPrevWeek = (week: number) => {
    if (week <= 1) return 1;
    return week - 1;
  };

  const [selectedMatchup, setSelectedMatchup] = useState<number | null>(() => {
    const matchupParam = searchParams.get('matchup');
    if (matchupParam) {
      const matchupId = parseInt(matchupParam);
      if (!isNaN(matchupId)) {
        return matchupId;
      }
    }
    return null;
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<(typeof TEAMS[0] & {
    fpts?: number;
    avg?: number;
    last?: number;
    rank?: number;
    record?: string;
    status?: string;
  }) | null>(null);
  const [moveMode, setMoveMode] = useState(false);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);

  const matchups = generateMatchups(currentWeek);
  const selectedMatch = matchups.find(m => m.id === selectedMatchup);

  // Type for roster team - this matches the player structure from generatePlayers
  type RosterTeam = {
    id: string;
    name: string;
    team: typeof TEAMS[0];
    position: string;
    points: number;
    opponent: typeof TEAMS[0];
    opponentRank: number;
    opponentGameRecord: string;
    hasPlayed: boolean;
  };

  // Derive userRoster from selectedMatch - we need state because it can be edited
  const [userRoster, setUserRoster] = useState<RosterTeam[]>([]);
  const [lastMatchId, setLastMatchId] = useState<number | null>(null);

  // Only update userRoster when selectedMatch changes
  if (selectedMatch?.id !== lastMatchId) {
    setLastMatchId(selectedMatch?.id ?? null);
    setUserRoster(selectedMatch ? [...selectedMatch.team1.roster] : []);
  }

  const handleManagerClick = (managerName: string) => {
    // Navigate to opponents page - you'll need to map manager name to manager ID
    // For now using the manager name as the ID
    router.push(`/leagues/${leagueId}/opponents?manager=${encodeURIComponent(managerName)}`);
  };

  const handleMoveToggle = () => {
    setMoveMode(!moveMode);
    setSelectedTeamIndex(null);
  };

  const handleTeamClick = (index: number) => {
    if (!moveMode) return;

    if (selectedTeamIndex === null) {
      // First click - select the team
      setSelectedTeamIndex(index);
    } else if (selectedTeamIndex === index) {
      // Clicking the same team - deselect
      setSelectedTeamIndex(null);
    } else {
      // Second click - swap the teams but keep slots static
      const newRoster = [...userRoster];
      const team1Slot = newRoster[selectedTeamIndex].position;
      const team2Slot = newRoster[index].position;

      // Swap the entire team objects
      const temp = newRoster[selectedTeamIndex];
      newRoster[selectedTeamIndex] = newRoster[index];
      newRoster[index] = temp;

      // Restore the original slots
      newRoster[selectedTeamIndex] = { ...newRoster[selectedTeamIndex], position: team1Slot };
      newRoster[index] = { ...newRoster[index], position: team2Slot };

      setUserRoster(newRoster);
      setSelectedTeamIndex(null);
    }
  };

  const openTeamModal = (player: { team: typeof TEAMS[0]; name: string }) => {
    setSelectedTeam({
      ...player.team,
      fpts: 425,
      avg: 53,
      last: 52,
      rank: ((player.team.name?.length ?? 5) % 10) + 1,
      record: "8-2",
      status: "free-agent"
    });
    setShowModal(true);
  };

  const getTopPerformers = (roster: RosterTeam[]) => {
    return roster
      .filter(p => p.hasPlayed)
      .sort((a, b) => b.points - a.points)
      .slice(0, 2);
  };

  const getToPlayCount = (roster: RosterTeam[]) => {
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
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Team Stats Modal */}
        <TeamModal
          team={showModal && selectedTeam ? {
            ...selectedTeam,
            rosteredBy: (selectedTeam.rank ?? 0) % 2 === 0 ? { rosterName: "Fantastic Ballers", managerName: "xenn" } : undefined
          } : null}
          onClose={() => setShowModal(false)}
        />

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
                marginBottom: "0.25rem",
                cursor: "pointer",
                transition: "color 0.2s"
              }}
                onClick={() => handleManagerClick(selectedMatch.team1.managerName)}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.color = getTeamColor(selectedMatch.team1.score, selectedMatch.team2.score, true)}
              >
                {selectedMatch.team1.teamName}
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                margin: 0,
                cursor: "pointer",
                transition: "color 0.2s"
              }}
                onClick={() => handleManagerClick(selectedMatch.team1.managerName)}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
              >
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
                marginBottom: "0.25rem",
                cursor: "pointer",
                transition: "color 0.2s"
              }}
                onClick={() => handleManagerClick(selectedMatch.team2.managerName)}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.color = getTeamColor(selectedMatch.team1.score, selectedMatch.team2.score, false)}
              >
                {selectedMatch.team2.teamName}
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                margin: 0,
                cursor: "pointer",
                transition: "color 0.2s"
              }}
                onClick={() => handleManagerClick(selectedMatch.team2.managerName)}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
              >
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

          {/* Edit Lineup Button */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem", marginBottom: "1rem" }}>
            <button
              onClick={handleMoveToggle}
              className={moveMode ? "btn btn-primary" : "btn btn-ghost"}
              style={{
                fontSize: "0.9rem",
                border: "2px solid var(--accent)",
                boxShadow: moveMode ? "0 0 12px rgba(242, 182, 50, 0.4)" : "0 0 8px rgba(242, 182, 50, 0.3)"
              }}
            >
              {moveMode ? "✓ Done Editing" : "Edit Lineup"}
            </button>
          </div>

          {/* Move Mode Instructions */}
          {moveMode && (
            <div style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "rgba(242, 182, 50, 0.1)",
              border: "1px solid rgba(242, 182, 50, 0.3)",
              borderRadius: "8px",
              color: "var(--accent)",
              fontSize: "0.9rem",
              fontWeight: 600,
              textAlign: "center",
              marginBottom: "1rem"
            }}>
              {selectedTeamIndex === null
                ? "Click on a team in your roster to select it, then click on another team to swap positions"
                : "Click on another team to swap positions, or click the selected team to deselect"}
            </div>
          )}

          {/* Roster Breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {userRoster.map((player1, idx) => {
              const player2 = selectedMatch.team2.roster[idx];
              const isSelected = selectedTeamIndex === idx;
              const baseBackground = idx % 2 === 0 ? "rgba(255,255,255,0.05)" : "transparent";

              return (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr auto 1fr 2fr",
                    gap: "1rem",
                    alignItems: "center",
                    padding: "0.75rem 1rem",
                    background: baseBackground,
                    borderRadius: "6px"
                  }}
                >
                  {/* Team 1 Player - Clickable for editing */}
                  <div
                    onClick={() => handleTeamClick(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      cursor: moveMode ? "pointer" : "default",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      background: isSelected ? "rgba(242, 182, 50, 0.2)" : "transparent",
                      borderLeft: isSelected ? "3px solid var(--accent)" : "3px solid transparent",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (moveMode && !isSelected) {
                        e.currentTarget.style.background = "rgba(242, 182, 50, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (moveMode && !isSelected) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <Image
                      src={player1.team.logoPath}
                      alt={player1.name}
                      width={30}
                      height={30}
                      style={{ borderRadius: "4px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        onClick={(e) => {
                          if (!moveMode) {
                            e.stopPropagation();
                            openTeamModal(player1);
                          }
                        }}
                        style={{
                          color: "#ffffff",
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          cursor: moveMode ? "default" : "pointer",
                          transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          if (!moveMode) {
                            e.currentTarget.style.color = "var(--accent)";
                          }
                        }}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#ffffff"}
                      >
                        {player1.name}
                      </div>
                      {player1.hasPlayed && (
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                          vs. {player1.opponent.name} {player1.opponentGameRecord}{" "}
                          <span style={{ color: getFantasyRankColor(player1.opponentRank) }}>
                            ({player1.opponentRank}{player1.opponentRank === 1 ? 'st' : player1.opponentRank === 2 ? 'nd' : player1.opponentRank === 3 ? 'rd' : 'th'})
                          </span>
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
                        style={{ color: "#ffffff", fontSize: "0.95rem", fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#ffffff"}
                      >
                        {player2.name}
                      </div>
                      {player2.hasPlayed && (
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                          vs. {player2.opponent.name} {player2.opponentGameRecord}{" "}
                          <span style={{ color: getFantasyRankColor(player2.opponentRank) }}>
                            ({player2.opponentRank}{player2.opponentRank === 1 ? 'st' : player2.opponentRank === 2 ? 'nd' : player2.opponentRank === 3 ? 'rd' : 'th'})
                          </span>
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
      </div>
    );
  }

  // Scoreboard View
  return (
    <>
      {/* Team Stats Modal */}
      <TeamModal
        team={showModal && selectedTeam ? {
          ...selectedTeam,
          rosteredBy: (selectedTeam.rank ?? 0) % 2 === 0 ? { rosterName: "Whiffers", managerName: "Omegz" } : undefined
        } : null}
        onClose={() => setShowModal(false)}
      />

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem"
      }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>Scoreboard</h1>

        {/* Week Navigation */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <button
            onClick={() => setCurrentWeek(prev => getPrevWeek(prev))}
            disabled={currentWeek === 1}
            style={{
              background: "transparent",
              border: "none",
              color: currentWeek === 1 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
              cursor: currentWeek === 1 ? "not-allowed" : "pointer",
              fontSize: "1rem"
            }}
          >
            ◄ Week {getPrevWeek(currentWeek)}
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
            onClick={() => setCurrentWeek(prev => getNextWeek(prev))}
            disabled={currentWeek === 10}
            style={{
              background: "transparent",
              border: "none",
              color: currentWeek === 10 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
              cursor: currentWeek === 10 ? "not-allowed" : "pointer",
              fontSize: "1rem"
            }}
          >
            Week {getNextWeek(currentWeek)} ►
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
                      marginBottom: "0.25rem",
                      cursor: "pointer",
                      transition: "color 0.2s"
                    }}
                      onClick={() => handleManagerClick(matchup.team1.managerName)}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = getTeamColor(matchup.team1.score, matchup.team2.score, true)}
                    >
                      {matchup.team1.teamName}
                    </h2>
                    <p style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.8rem",
                      margin: 0
                    }}>
                      <span
                        onClick={() => handleManagerClick(matchup.team1.managerName)}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                        style={{
                          cursor: "pointer",
                          color: "rgba(255,255,255,0.6)",
                          transition: "color 0.2s"
                        }}
                      >
                        {matchup.team1.managerName}
                      </span> {matchup.team1.record} {matchup.team1.standing}
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
                      marginBottom: "0.25rem",
                      cursor: "pointer",
                      transition: "color 0.2s"
                    }}
                      onClick={() => handleManagerClick(matchup.team2.managerName)}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = getTeamColor(matchup.team1.score, matchup.team2.score, false)}
                    >
                      {matchup.team2.teamName}
                    </h2>
                    <p style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.8rem",
                      margin: 0
                    }}>
                      <span
                        onClick={() => handleManagerClick(matchup.team2.managerName)}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                        style={{
                          cursor: "pointer",
                          color: "rgba(255,255,255,0.6)",
                          transition: "color 0.2s"
                        }}
                      >
                        {matchup.team2.managerName}
                      </span> {matchup.team2.record} {matchup.team2.standing}
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
                        <span
                          onClick={() => openTeamModal(player)}
                          style={{
                            color: "#ffffff",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#ffffff"}
                        >
                          {player.team.leagueId} {player.name}
                        </span>
                        <span style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.7rem"
                        }}>
                          {player.position}
                        </span>
                        <span style={{
                          color: (player.team.leagueId in LEAGUE_COLORS ? LEAGUE_COLORS[player.team.leagueId as keyof typeof LEAGUE_COLORS] : "#4da6ff"),
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
                        <span
                          onClick={() => openTeamModal(player)}
                          style={{
                            color: "#ffffff",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#ffffff"}
                        >
                          {player.team.leagueId} {player.name}
                        </span>
                        <span style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.7rem"
                        }}>
                          {player.position}
                        </span>
                        <span style={{
                          color: (player.team.leagueId in LEAGUE_COLORS ? LEAGUE_COLORS[player.team.leagueId as keyof typeof LEAGUE_COLORS] : "#4da6ff"),
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
