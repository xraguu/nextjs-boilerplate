"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";
import TeamModal from "@/components/TeamModal";

// Helper function to get fantasy rank color
const getFantasyRankColor = (rank: number): string => {
  if (rank >= 1 && rank <= 12) return "#ef4444"; // red
  if (rank >= 13 && rank <= 24) return "#9ca3af"; // gray
  if (rank >= 25 && rank <= 32) return "#22c55e"; // green
  return "#9ca3af"; // default gray
};

interface OpponentRoster {
  slot: string;
  name: string;
  score: number;
  opponent: string;
  oprk: number;
  fprk: number;
  fpts: number;
  avg: number;
  last: number;
  goals: number;
  shots: number;
  saves: number;
  assists: number;
  demos: number;
  teamRecord: string;
  opponentGameRecord: string;
  opponentFantasyRank: number;
}

interface OpponentData {
  id: string;
  name: string;
  teamName: string;
  record: string;
  place: string;
  totalPoints: number;
  avgPoints: number;
  currentWeek: number;
  lastMatchup?: {
    myTeam: string;
    myScore: number;
    opponent: string;
    opponentScore: number;
  };
  currentMatchup?: {
    myTeam: string;
    myScore: number;
    opponent: string;
    opponentScore: number;
  };
  teams: OpponentRoster[];
}

export default function OpponentsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leagueId = params.LeagueID as string;
  const teamIdParam = searchParams.get("teamId");

  const [opponents, setOpponents] = useState<OpponentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(teamIdParam);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeTab, setActiveTab] = useState<"lineup" | "stats">("lineup");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<(typeof TEAMS[0] & {
    fpts?: number;
    avg?: number;
    last?: number;
    rank?: number;
    record?: string;
    status?: string;
  }) | null>(null);

  // Track game mode for stats tab (2s or 3s)
  const [gameMode, setGameMode] = useState<"2s" | "3s">("2s");

  // Track game modes for each slot
  const [slotModes, setSlotModes] = useState<string[]>([]);

  // Fetch opponents data
  useEffect(() => {
    const fetchOpponents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/leagues/${leagueId}/opponents?week=${currentWeek}`);

        if (!response.ok) {
          throw new Error("Failed to fetch opponents");
        }

        const data = await response.json();
        setOpponents(data.opponents || []);

        // Set default selected manager to first opponent only if no teamId param and no selection
        if (data.opponents && data.opponents.length > 0 && !selectedManagerId && !teamIdParam) {
          setSelectedManagerId(data.opponents[0].id);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load opponents");
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchOpponents();
    }
  }, [leagueId, currentWeek, selectedManagerId]);

  // Derived values
  const selectedManager = opponents.find(m => m.id === selectedManagerId);
  const roster = selectedManager || null;

  // Initialize slot modes when roster changes
  useEffect(() => {
    if (selectedManager && selectedManager.teams) {
      setSlotModes(selectedManager.teams.map(() => "2s"));
    }
  }, [selectedManager]);

  // Helper functions for week navigation (weeks 1-10)
  const getNextWeek = (week: number) => {
    if (week >= 10) return 10;
    return week + 1;
  };

  const getPrevWeek = (week: number) => {
    if (week <= 1) return 1;
    return week - 1;
  };

  // Stats tab sorting state
  const [statsSortColumn, setStatsSortColumn] = useState<"fprk" | "fpts" | "avg" | "last" | "goals" | "shots" | "saves" | "assists" | "demos">("fprk");
  const [statsSortDirection, setStatsSortDirection] = useState<"asc" | "desc">("asc");

  const handleStatsSort = (column: typeof statsSortColumn) => {
    if (statsSortColumn === column) {
      setStatsSortDirection(statsSortDirection === "asc" ? "desc" : "asc");
    } else {
      setStatsSortColumn(column);
      setStatsSortDirection("asc");
    }
  };

  // Sorted roster teams for stats tab
  const sortedRosterTeams = useMemo(() => {
    if (!roster || !roster.teams) return [];
    return [...roster.teams].sort((a, b) => {
      const aValue = a[statsSortColumn];
      const bValue = b[statsSortColumn];
      if (statsSortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [statsSortColumn, statsSortDirection, roster]);

  const handleTeamClick = (teamName: string) => {
    // Parse team name like "Flames CL" to get "CL" and "Flames"
    const parts = teamName.split(" ");
    const leagueId = parts[parts.length - 1];
    const name = parts.slice(0, -1).join(" ");
    const teamId = `${leagueId}${name.replace(/\s+/g, "")}`;
    const team = TEAMS.find(t => t.id === teamId);
    if (team) {
      const nameHash = (team.name?.length ?? 5);
      setSelectedTeam({
        ...team,
        fpts: 450 + (nameHash % 50),
        avg: 55 + (nameHash % 15),
        last: 50 + (nameHash % 20),
        rank: (nameHash % 10) + 1,
        record: `${7 + (nameHash % 3)}-${1 + (nameHash % 3)}`,
        status: "free-agent"
      });
      setShowModal(true);
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Loading opponents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#ef4444", fontSize: "1.1rem" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (opponents.length === 0) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>No opponents found in this league</div>
      </div>
    );
  }

  if (!roster) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Select an opponent to view their roster</div>
      </div>
    );
  }

  return (
    <>
      {/* Team Modal */}
      <TeamModal
        team={showModal && selectedTeam ? {
          ...selectedTeam,
          rosteredBy: (selectedTeam.rank ?? 0) % 2 === 0 ? { rosterName: "Pixies", managerName: "Crazy" } : undefined
        } : null}
        onClose={() => setShowModal(false)}
      />

      {/* Page Header with Dropdown */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>Opponents</h1>

        {/* Manager Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#ffffff",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              minWidth: "200px",
              justifyContent: "space-between"
            }}
          >
            <span>{roster.name}</span>
            <span>{dropdownOpen ? "▲" : "▼"}</span>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                borderRadius: "8px",
                padding: "0.5rem 0",
                minWidth: "220px",
                maxHeight: "400px",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                zIndex: 1000
              }}
            >
              {opponents.map((opponent) => (
                <button
                  key={opponent.id}
                  onClick={() => {
                    setSelectedManagerId(opponent.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: opponent.id === selectedManagerId ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "none",
                    color: "#ffffff",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (opponent.id !== selectedManagerId) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {opponent.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                    {opponent.teamName}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
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
                {roster.record}
              </span>{" "}
              <span style={{ color: "var(--text-muted)", fontSize: "1.2rem", marginLeft: "0.5rem" }}>
                {roster.place}
              </span>
            </h2>
            <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{roster.name}</div>
            <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{roster.totalPoints} Fantasy Points</span>
              <span style={{ color: "var(--text-muted)", marginLeft: "1.5rem" }}>{roster.avgPoints} Avg Fantasy Points</span>
            </div>
          </div>

          {/* Matchup Info */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {/* Last Matchup */}
            {roster.lastMatchup && (
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
            )}

            {roster.lastMatchup && roster.currentMatchup && (
              <div style={{ width: "1px", height: "60px", backgroundColor: "rgba(255,255,255,0.1)" }}></div>
            )}

            {/* Current Matchup */}
            {roster.currentMatchup && (
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
            )}

            {!roster.lastMatchup && !roster.currentMatchup && (
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
                No matchup data available
              </div>
            )}
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
          {/* Week Navigation */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setCurrentWeek(prev => getPrevWeek(prev))}
                disabled={currentWeek === 1}
                style={{
                  background: "transparent",
                  border: "none",
                  color:
                    currentWeek === 1
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(255,255,255,0.7)",
                  cursor: currentWeek === 1 ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                }}
              >
                {currentWeek === 1 ? "◄" : `◄ Week ${getPrevWeek(currentWeek)}`}
              </button>

              <span
                style={{
                  color: "#d4af37",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  padding: "0 1rem",
                }}
              >
                Week {currentWeek}
              </span>

              <button
                onClick={() => setCurrentWeek(prev => getNextWeek(prev))}
                disabled={currentWeek === 10}
                style={{
                  background: "transparent",
                  border: "none",
                  color:
                    currentWeek === 10
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(255,255,255,0.7)",
                  cursor: currentWeek === 10 ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                }}
              >
                {currentWeek === 10 ? "►" : `Week ${getNextWeek(currentWeek)} ►`}
              </button>
            </div>
            <a
              href={`/leagues/${leagueId}/opponents/${selectedManagerId}/trade`}
              className="btn btn-primary"
              style={{ fontSize: "0.9rem" }}
            >
              Propose Trade
            </a>
          </div>

          {/* Roster Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", width: "50px" }}></th>
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
                {roster.teams.map((team, index) => {
                  const isEmpty = !team.name;
                  const isBench = team.slot === "BE";
                  const currentMode = slotModes[index] || "2s";

                  return (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        backgroundColor: isBench ? "rgba(255,255,255,0.02)" : "transparent",
                        borderTop: isBench && index === 5 ? "2px solid rgba(255,255,255,0.15)" : "none"
                      }}
                    >
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", justifyContent: "center" }}>
                          {!isEmpty && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newModes = [...slotModes];
                                  newModes[index] = slotModes[index] === "2s" ? "3s" : "2s";
                                  setSlotModes(newModes);
                                }}
                                style={{
                                  background: "rgba(255,255,255,0.1)",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: "var(--accent)",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(242, 182, 50, 0.2)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                              >
                                ⇄
                              </button>
                              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--accent)" }}>
                                {currentMode}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{
                        padding: "0.75rem 1rem",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: isBench ? "var(--text-muted)" : "var(--accent)"
                      }}>
                        {team.slot}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEmpty ? (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontStyle: "italic" }}>
                            Empty
                          </span>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {/* Team Logo */}
                            {(() => {
                              const parts = team.name.split(" ");
                              const leagueId = parts[parts.length - 1];
                              const name = parts.slice(0, -1).join(" ");
                              const teamId = `${leagueId}${name.replace(/\s+/g, "")}`;
                              const teamData = TEAMS.find(t => t.id === teamId);
                              return teamData ? (
                                <Image
                                  src={teamData.logoPath}
                                  alt={team.name}
                                  width={32}
                                  height={32}
                                  style={{ borderRadius: "4px" }}
                                />
                              ) : null;
                            })()}
                            <div>
                              <div
                                onClick={() => handleTeamClick(team.name)}
                                style={{
                                  fontWeight: 600,
                                  fontSize: "1rem",
                                  cursor: "pointer",
                                  color: "var(--text-main)",
                                  transition: "color 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                              >
                                {team.name}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                                {team.opponent && team.opponentGameRecord && team.opponentFantasyRank ? (
                                  <>
                                    vs. {team.opponent} {team.opponentGameRecord}{" "}
                                    <span style={{ color: getFantasyRankColor(team.opponentFantasyRank) }}>
                                      ({team.opponentFantasyRank}
                                      {team.opponentFantasyRank === 1 ? "st" :
                                       team.opponentFantasyRank === 2 ? "nd" :
                                       team.opponentFantasyRank === 3 ? "rd" : "th"})
                                    </span>
                                  </>
                                ) : (
                                  "vs. - -"
                                )}
                              </div>
                            </div>
                          </div>
                        )}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <section className="card">
          {/* Week Navigation and 2s/3s Switch */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setCurrentWeek(prev => getPrevWeek(prev))}
                disabled={currentWeek === 1}
                style={{
                  background: "transparent",
                  border: "none",
                  color:
                    currentWeek === 1
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(255,255,255,0.7)",
                  cursor: currentWeek === 1 ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                }}
              >
                {currentWeek === 1 ? "◄" : `◄ Week ${getPrevWeek(currentWeek)}`}
              </button>

              <span
                style={{
                  color: "#d4af37",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  padding: "0 1rem",
                }}
              >
                Week {currentWeek}
              </span>

              <button
                onClick={() => setCurrentWeek(prev => getNextWeek(prev))}
                disabled={currentWeek === 10}
                style={{
                  background: "transparent",
                  border: "none",
                  color:
                    currentWeek === 10
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(255,255,255,0.7)",
                  cursor: currentWeek === 10 ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                }}
              >
                {currentWeek === 10 ? "►" : `Week ${getNextWeek(currentWeek)} ►`}
              </button>
            </div>

            {/* 2s/3s Switch */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "6px",
                padding: "0.25rem",
              }}
            >
              <button
                onClick={() => setGameMode("2s")}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor:
                    gameMode === "2s" ? "var(--accent)" : "transparent",
                  color: gameMode === "2s" ? "#1a1a2e" : "var(--text-main)",
                  transition: "all 0.2s ease",
                }}
              >
                2s
              </button>
              <button
                onClick={() => setGameMode("3s")}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor:
                    gameMode === "3s" ? "var(--accent)" : "transparent",
                  color: gameMode === "3s" ? "#1a1a2e" : "var(--text-main)",
                  transition: "all 0.2s ease",
                }}
              >
                3s
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", width: "50px" }}></th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Score</th>
                  <th
                    onClick={() => handleStatsSort("fprk")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    Fprk {statsSortColumn === "fprk" && (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleStatsSort("fpts")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    Fpts {statsSortColumn === "fpts" && (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleStatsSort("avg")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    Avg {statsSortColumn === "avg" && (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleStatsSort("last")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    Last {statsSortColumn === "last" && (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleStatsSort("goals")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    Goals {statsSortColumn === "goals" && (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleStatsSort("shots")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    Shots {statsSortColumn === "shots" && (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleStatsSort("saves")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    Saves {statsSortColumn === "saves" && (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleStatsSort("assists")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    Assists {statsSortColumn === "assists" && (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleStatsSort("demos")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    Demos {statsSortColumn === "demos" && (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                </tr>
              </thead>
              <tbody>
                {sortedRosterTeams.map((team, index) => {
                  const isEmpty = !team.name;

                  return (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)"
                      }}
                    >
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent)" }}>
                          {gameMode}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)" }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEmpty ? (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontStyle: "italic" }}>
                            Empty
                          </span>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {/* Team Logo (smaller for stats tab) */}
                            {(() => {
                              const parts = team.name.split(" ");
                              const leagueId = parts[parts.length - 1];
                              const name = parts.slice(0, -1).join(" ");
                              const teamId = `${leagueId}${name.replace(/\s+/g, "")}`;
                              const teamData = TEAMS.find(t => t.id === teamId);
                              return teamData ? (
                                <Image
                                  src={teamData.logoPath}
                                  alt={team.name}
                                  width={24}
                                  height={24}
                                  style={{ borderRadius: "4px" }}
                                />
                              ) : null;
                            })()}
                            <div>
                              <div
                                onClick={() => handleTeamClick(team.name)}
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
                                {team.name}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                                {team.opponent && team.opponentGameRecord && team.opponentFantasyRank ? (
                                  <>
                                    vs. {team.opponent} {team.opponentGameRecord}{" "}
                                    <span style={{ color: getFantasyRankColor(team.opponentFantasyRank) }}>
                                      ({team.opponentFantasyRank}
                                      {team.opponentFantasyRank === 1 ? "st" :
                                       team.opponentFantasyRank === 2 ? "nd" :
                                       team.opponentFantasyRank === 3 ? "rd" : "th"})
                                    </span>
                                  </>
                                ) : (
                                  "vs. - -"
                                )}
                              </div>
                            </div>
                          </div>
                        )}
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
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.goals || "-"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.shots || "-"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.saves || "-"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.assists || "-"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                        {team.demos || "-"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        {team.teamRecord || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
