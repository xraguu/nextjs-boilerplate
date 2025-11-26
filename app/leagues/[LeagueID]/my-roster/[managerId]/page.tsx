"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import TeamModal from "@/components/TeamModal";

// Types
interface MLETeam {
  id: string;
  name: string;
  leagueId: string;
  slug: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
  weeklyStats: any | null;
}

interface RosterSlot {
  id: string;
  position: string;
  slotIndex: number;
  isLocked: boolean;
  fantasyPoints: number | null;
  mleTeam: MLETeam | null;
}

interface RosterData {
  fantasyTeam: {
    id: string;
    displayName: string;
    shortCode: string;
    ownerDisplayName: string;
    faabRemaining: number | null;
    waiverPriority: number | null;
  };
  league: {
    id: string;
    currentWeek: number;
    waiverSystem: string;
    rosterConfig: {
      "2s": number;
      "3s": number;
      flx: number;
      be: number;
    };
  };
  week: number;
  rosterSlots: RosterSlot[];
  record?: {
    wins: number;
    losses: number;
  };
  rank?: number;
  totalTeams?: number;
}

// Helper function to get fantasy rank color (matching main page)
const getFantasyRankColor = (rank: number): string => {
  if (rank >= 1 && rank <= 12) return "#ef4444";
  if (rank >= 13 && rank <= 24) return "#9ca3af";
  if (rank >= 25 && rank <= 32) return "#22c55e";
  return "#9ca3af";
};

export default function MyRosterPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.LeagueID as string;
  const teamId = params.managerId as string;

  const [rosterData, setRosterData] = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "lineup" | "stats" | "waivers" | "trades"
  >("lineup");
  const [moveMode, setMoveMode] = useState(false);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(
    null
  );
  const [gameMode, setGameMode] = useState<"2s" | "3s">("2s");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editableRoster, setEditableRoster] = useState<RosterSlot[]>([]);

  // Trades state
  const [trades, setTrades] = useState<any[]>([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  // Track game modes for each slot
  const [slotModes, setSlotModes] = useState<string[]>([]);

  // Stats tab sorting state
  const [statsSortColumn, setStatsSortColumn] = useState<
    | "fprk"
    | "fpts"
    | "avg"
    | "last"
    | "goals"
    | "shots"
    | "saves"
    | "assists"
    | "demos"
  >("fprk");
  const [statsSortDirection, setStatsSortDirection] = useState<"asc" | "desc">(
    "asc"
  );

  // Drop modal state
  const [showDropModal, setShowDropModal] = useState(false);
  const [selectedDropSlot, setSelectedDropSlot] = useState<RosterSlot | null>(
    null
  );

  // Team modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<MLETeam | null>(null);

  // Generate full roster with empty slots
  const fullRoster = useMemo(() => {
    if (!rosterData) return [];

    const config = rosterData.league.rosterConfig;
    const existingSlots = rosterData.rosterSlots;
    const slots: RosterSlot[] = [];

    const createEmptySlot = (
      position: string,
      slotIndex: number
    ): RosterSlot => ({
      id: `empty-${position}-${slotIndex}`,
      position,
      slotIndex,
      isLocked: false,
      fantasyPoints: null,
      mleTeam: null,
    });

    for (let i = 0; i < config["2s"]; i++) {
      const existing = existingSlots.find(
        (s) => s.position === "2s" && s.slotIndex === i
      );
      slots.push(existing || createEmptySlot("2s", i));
    }

    for (let i = 0; i < config["3s"]; i++) {
      const existing = existingSlots.find(
        (s) => s.position === "3s" && s.slotIndex === i
      );
      slots.push(existing || createEmptySlot("3s", i));
    }

    for (let i = 0; i < config.flx; i++) {
      const existing = existingSlots.find(
        (s) => s.position === "flx" && s.slotIndex === i
      );
      slots.push(existing || createEmptySlot("flx", i));
    }

    for (let i = 0; i < config.be; i++) {
      const existing = existingSlots.find(
        (s) => s.position === "be" && s.slotIndex === i
      );
      slots.push(existing || createEmptySlot("be", i));
    }

    return slots;
  }, [rosterData]);

  // Initialize slot modes and editable roster
  useEffect(() => {
    if (fullRoster.length > 0) {
      setSlotModes(new Array(fullRoster.length).fill("2s"));
      setEditableRoster([...fullRoster]);
      setHasUnsavedChanges(false);
    }
  }, [fullRoster.length]);

  // Fetch roster data
  useEffect(() => {
    const fetchRoster = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/leagues/${leagueId}/rosters/${teamId}?week=${currentWeek}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch roster");
        }

        const data = await response.json();
        setRosterData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load roster");
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [leagueId, teamId, currentWeek]);

  // Initialize current week only on first load
  useEffect(() => {
    if (rosterData && currentWeek === 1 && rosterData.league.currentWeek !== 1) {
      setCurrentWeek(rosterData.league.currentWeek);
    }
  }, [rosterData?.league.currentWeek]);

  // Fetch trades when trades tab is active
  useEffect(() => {
    const fetchTrades = async () => {
      if (activeTab !== "trades" || !teamId || !leagueId) return;

      try {
        setTradesLoading(true);
        const response = await fetch(
          `/api/leagues/${leagueId}/trades?teamId=${teamId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trades");
        }

        const data = await response.json();
        setTrades(data.trades || []);
      } catch (error) {
        console.error("Error fetching trades:", error);
      } finally {
        setTradesLoading(false);
      }
    };

    fetchTrades();
  }, [activeTab, teamId, leagueId]);

  const handleScheduleClick = () => {
    router.push(`/leagues/${leagueId}/my-roster/${teamId}/schedule`);
  };

  const handleTransactionsClick = () => {
    router.push(`/leagues/${leagueId}/my-roster/${teamId}/transactions`);
  };

  const handleSaveRoster = async () => {
    if (!rosterData) return;

    try {
      setIsSaving(true);

      const response = await fetch(
        `/api/leagues/${leagueId}/roster/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fantasyTeamId: rosterData.fantasyTeam.id,
            week: currentWeek,
            roster: editableRoster,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save roster");
      }

      setHasUnsavedChanges(false);

      // Refetch roster to get updated data
      const rosterResponse = await fetch(
        `/api/leagues/${leagueId}/rosters/${teamId}?week=${currentWeek}`
      );
      if (rosterResponse.ok) {
        const updatedRoster = await rosterResponse.json();
        setRosterData(updatedRoster);
      }
    } catch (error) {
      console.error("Error saving roster:", error);
      alert(error instanceof Error ? error.message : "Failed to save lineup");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveToggle = async () => {
    if (moveMode && hasUnsavedChanges) {
      // Save changes when exiting move mode
      await handleSaveRoster();
    }
    setMoveMode(!moveMode);
    setSelectedTeamIndex(null);
  };

  const handleTeamClick = (index: number) => {
    if (!moveMode) return;

    const slot = editableRoster[index];
    if (!slot.mleTeam) return; // Can't select empty slots

    if (selectedTeamIndex === null) {
      setSelectedTeamIndex(index);
    } else if (selectedTeamIndex === index) {
      setSelectedTeamIndex(null);
    } else {
      // Swap the teams but keep slots static
      const newRoster = [...editableRoster];
      const team1Slot = newRoster[selectedTeamIndex].position;
      const team2Slot = newRoster[index].position;

      // Swap the entire team objects
      const temp = newRoster[selectedTeamIndex];
      newRoster[selectedTeamIndex] = newRoster[index];
      newRoster[index] = temp;

      // Restore the original slots
      newRoster[selectedTeamIndex] = {
        ...newRoster[selectedTeamIndex],
        position: team1Slot,
        slotIndex: newRoster[selectedTeamIndex].slotIndex,
      };
      newRoster[index] = {
        ...newRoster[index],
        position: team2Slot,
        slotIndex: newRoster[index].slotIndex,
      };

      setEditableRoster(newRoster);
      setSelectedTeamIndex(null);
      setHasUnsavedChanges(true);
    }
  };

  const getPrevWeek = (week: number) => Math.max(1, week - 1);
  const getNextWeek = (week: number) => week + 1;

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
    return fullRoster
      .filter((slot) => slot.mleTeam)
      .map((slot, index) => {
        const stats = slot.mleTeam!.weeklyStats || {};

        return {
          ...slot.mleTeam,
          displayStats: {
            score: slot.fantasyPoints || 0,
            fprk: index + 1,
            fpts: stats.fantasyPoints || 0,
            avg: stats.avgFantasyPoints || 0,
            last: stats.lastWeekPoints || 0,
            goals: stats.goals || 0,
            shots: stats.shots || 0,
            saves: stats.saves || 0,
            assists: stats.assists || 0,
            demos: stats.demos || 0,
            teamRecord: stats.record || "-",
          },
        };
      })
      .sort((a, b) => {
        const aValue = a.displayStats[statsSortColumn] as number;
        const bValue = b.displayStats[statsSortColumn] as number;

        if (aValue === bValue) return 0;
        if (statsSortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [fullRoster, statsSortColumn, statsSortDirection]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Loading roster...
        </div>
      </div>
    );
  }

  if (error || !rosterData) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#ef4444", fontSize: "1.1rem" }}>
          Error: {error || "Failed to load roster"}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1
          className="page-heading"
          style={{
            fontSize: "2.5rem",
            color: "var(--accent)",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Roster
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={handleScheduleClick}
            style={{
              backgroundColor: "var(--accent)",
              color: "#1a1a2e",
              padding: "0.5rem 1.5rem",
              borderRadius: "2rem",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Schedule
          </button>
          <button
            onClick={handleTransactionsClick}
            style={{
              backgroundColor: "var(--accent)",
              color: "#1a1a2e",
              padding: "0.5rem 1.5rem",
              borderRadius: "2rem",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Team Overview Card */}
      <section
        className="card"
        style={{ marginBottom: "1.5rem", padding: "1.5rem 2rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Team Info */}
          <div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "0.5rem",
                marginTop: 0,
              }}
            >
              {rosterData.fantasyTeam.displayName}{" "}
              {rosterData.record && (
                <>
                  <span
                    style={{ color: "var(--accent)", marginLeft: "0.75rem" }}
                  >
                    {rosterData.record.wins}-{rosterData.record.losses}
                  </span>{" "}
                  {rosterData.rank && rosterData.totalTeams && (
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "1.2rem",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {rosterData.rank}
                      {rosterData.rank === 1
                        ? "st"
                        : rosterData.rank === 2
                        ? "nd"
                        : rosterData.rank === 3
                        ? "rd"
                        : "th"}
                    </span>
                  )}
                </>
              )}
            </h2>
            <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              {rosterData.fantasyTeam.ownerDisplayName}
            </div>
            <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                0 Fantasy Points
              </span>
              <span
                style={{ color: "var(--text-muted)", marginLeft: "1.5rem" }}
              >
                0 Avg Fantasy Points
              </span>
            </div>
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.95rem",
                color: "var(--text-muted)",
              }}
            >
              {rosterData.league.waiverSystem === "faab" ? (
                <>
                  FAAB:{" "}
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    ${rosterData.fantasyTeam.faabRemaining ?? 100}
                  </span>
                </>
              ) : (
                <>
                  Waiver Priority:{" "}
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    #{rosterData.fantasyTeam.waiverPriority ?? "-"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Matchup Info */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {/* Last Matchup */}
            <div
              style={{
                textAlign: "center",
                cursor: "pointer",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                transition: "all 0.2s",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(242, 182, 50, 0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  marginBottom: "0.5rem",
                }}
              >
                Last Matchup
              </div>
              <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-main)" }}>-</span>{" "}
                <span
                  style={{
                    color: "var(--accent)",
                    fontWeight: 700,
                    marginLeft: "0.5rem",
                  }}
                >
                  -
                </span>
              </div>
              <div style={{ fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-muted)" }}>-</span>{" "}
                <span
                  style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}
                >
                  -
                </span>
              </div>
            </div>

            <div
              style={{
                width: "1px",
                height: "60px",
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            ></div>

            {/* Current Matchup */}
            <div
              style={{
                textAlign: "center",
                cursor: "pointer",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                transition: "all 0.2s",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(242, 182, 50, 0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  marginBottom: "0.5rem",
                }}
              >
                Current Matchup
              </div>
              <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-main)" }}>-</span>{" "}
                <span
                  style={{
                    color: "var(--accent)",
                    fontWeight: 700,
                    marginLeft: "0.5rem",
                  }}
                >
                  -
                </span>
              </div>
              <div style={{ fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-muted)" }}>-</span>{" "}
                <span
                  style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}
                >
                  -
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
          className={
            activeTab === "lineup" ? "btn btn-primary" : "btn btn-ghost"
          }
          style={{ fontSize: "1rem" }}
        >
          Lineup
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={
            activeTab === "stats" ? "btn btn-primary" : "btn btn-ghost"
          }
          style={{ fontSize: "1rem" }}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab("waivers")}
          className={
            activeTab === "waivers" ? "btn btn-primary" : "btn btn-ghost"
          }
          style={{ fontSize: "1rem" }}
        >
          Waivers
        </button>
        <button
          onClick={() => setActiveTab("trades")}
          className={
            activeTab === "trades" ? "btn btn-primary" : "btn btn-ghost"
          }
          style={{ fontSize: "1rem" }}
        >
          Trades
        </button>
      </div>

      {/* Lineup Tab */}
      {activeTab === "lineup" && (
        <section className="card">
          {/* Week Navigation and Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setCurrentWeek((prev) => getPrevWeek(prev))}
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
                onClick={() => setCurrentWeek((prev) => getNextWeek(prev))}
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
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => router.push(`/leagues/${leagueId}/team-portal`)}
                className="btn btn-primary"
                style={{ fontSize: "0.9rem" }}
              >
                + Add
              </button>
              <button
                onClick={() => setShowDropModal(true)}
                className="btn btn-ghost"
                style={{ fontSize: "0.9rem" }}
              >
                - Drop
              </button>
              <button
                onClick={handleMoveToggle}
                disabled={isSaving}
                className={moveMode ? "btn btn-primary" : "btn btn-ghost"}
                style={{
                  fontSize: "0.9rem",
                  border: "2px solid var(--accent)",
                  boxShadow: moveMode
                    ? "0 0 12px rgba(242, 182, 50, 0.4)"
                    : "0 0 8px rgba(242, 182, 50, 0.3)",
                  opacity: isSaving ? 0.6 : 1,
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                {isSaving
                  ? "Saving..."
                  : moveMode
                  ? "✓ Done Editing"
                  : "Edit Lineup"}
              </button>
            </div>
          </div>

          {/* Move Mode Instructions */}
          {moveMode && (
            <div
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "rgba(242, 182, 50, 0.1)",
                borderBottom: "1px solid rgba(242, 182, 50, 0.3)",
                color: "var(--accent)",
                fontSize: "0.9rem",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {selectedTeamIndex === null
                ? "Click on a team to select it, then click on another team to swap positions"
                : "Click on another team to swap positions, or click the selected team to deselect"}
            </div>
          )}

          {/* Roster Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", width: "50px" }}></th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Slot
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Team
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Score
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Opp
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Oprk
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Fprk
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Fpts
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Avg
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Last
                  </th>
                </tr>
              </thead>
              <tbody>
                {(editableRoster.length > 0 ? editableRoster : fullRoster).map((slot, index) => {
                  const currentMode = slotModes[index] || "2s";
                  const isEmpty = !slot.mleTeam;
                  const isBench = slot.position === "be";

                  return (
                    <tr
                      key={slot.id}
                      onClick={() => handleTeamClick(index)}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        backgroundColor:
                          selectedTeamIndex === index
                            ? "rgba(242, 182, 50, 0.2)"
                            : isBench
                            ? "rgba(255,255,255,0.02)"
                            : "transparent",
                        borderTop:
                          isBench &&
                          index ===
                            (editableRoster.length > 0 ? editableRoster : fullRoster).findIndex((s) => s.position === "be")
                            ? "2px solid rgba(255,255,255,0.15)"
                            : "none",
                        cursor: moveMode && !isEmpty ? "pointer" : "default",
                        transition: "background-color 0.2s",
                        borderLeft:
                          selectedTeamIndex === index
                            ? "3px solid var(--accent)"
                            : "3px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          moveMode &&
                          selectedTeamIndex !== index &&
                          !isEmpty
                        ) {
                          e.currentTarget.style.backgroundColor =
                            "rgba(242, 182, 50, 0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (moveMode && selectedTeamIndex !== index) {
                          e.currentTarget.style.backgroundColor = isBench
                            ? "rgba(255,255,255,0.02)"
                            : "transparent";
                        }
                      }}
                    >
                      <td
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            justifyContent: "center",
                          }}
                        >
                          {!isEmpty && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newModes = [...slotModes];
                                  newModes[index] =
                                    slotModes[index] === "2s" ? "3s" : "2s";
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
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(242, 182, 50, 0.2)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.1)")
                                }
                              >
                                ⇄
                              </button>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  color: "var(--accent)",
                                }}
                              >
                                {currentMode}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: isBench
                            ? "var(--text-muted)"
                            : "var(--accent)",
                        }}
                      >
                        {slot.position === "be" || slot.position === "flx" ? slot.position.toUpperCase() : slot.position}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEmpty ? (
                          <span
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "0.95rem",
                              fontStyle: "italic",
                            }}
                          >
                            Empty
                          </span>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <Image
                              src={slot.mleTeam.logoPath}
                              alt={slot.mleTeam.name}
                              width={32}
                              height={32}
                              style={{ borderRadius: "4px" }}
                            />
                            <div>
                              <div
                                onClick={(e) => {
                                  if (!moveMode) {
                                    e.stopPropagation();
                                    setSelectedTeam(slot.mleTeam);
                                    setShowModal(true);
                                  }
                                }}
                                style={{
                                  fontWeight: 600,
                                  fontSize: "1rem",
                                  cursor: moveMode ? "default" : "pointer",
                                  color: "var(--text-main)",
                                  transition: "color 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  if (!moveMode) {
                                    e.currentTarget.style.color =
                                      "var(--accent)";
                                  }
                                }}
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--text-main)")
                                }
                              >
                                {slot.mleTeam.leagueId} {slot.mleTeam.name}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-muted)",
                                  marginTop: "0.15rem",
                                }}
                              >
                                vs. - -
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: slot.fantasyPoints
                            ? "var(--accent)"
                            : "var(--text-muted)",
                        }}
                      >
                        {slot.fantasyPoints
                          ? slot.fantasyPoints.toFixed(1)
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontSize: "0.9rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        -
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        -
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "center",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        -
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "right",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        -
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "right",
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                        }}
                      >
                        -
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "right",
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                        }}
                      >
                        -
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
          {/* Week Navigation and Game Mode Toggle */}
          <div
            style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setCurrentWeek((prev) => getPrevWeek(prev))}
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
                onClick={() => setCurrentWeek((prev) => getNextWeek(prev))}
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
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Rank
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Team
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Score
                  </th>
                  <th
                    onClick={() => handleStatsSort("fprk")}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    Fprk{" "}
                    {statsSortColumn === "fprk" &&
                      (statsSortDirection === "asc" ? "▲" : "▼")}
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
                      userSelect: "none",
                    }}
                  >
                    Fpts{" "}
                    {statsSortColumn === "fpts" &&
                      (statsSortDirection === "asc" ? "▲" : "▼")}
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
                      userSelect: "none",
                    }}
                  >
                    Avg{" "}
                    {statsSortColumn === "avg" &&
                      (statsSortDirection === "asc" ? "▲" : "▼")}
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
                      userSelect: "none",
                    }}
                  >
                    Last{" "}
                    {statsSortColumn === "last" &&
                      (statsSortDirection === "asc" ? "▲" : "▼")}
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
                      userSelect: "none",
                    }}
                  >
                    Goals{" "}
                    {statsSortColumn === "goals" &&
                      (statsSortDirection === "asc" ? "▲" : "▼")}
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
                      userSelect: "none",
                    }}
                  >
                    Shots{" "}
                    {statsSortColumn === "shots" &&
                      (statsSortDirection === "asc" ? "▲" : "▼")}
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
                      userSelect: "none",
                    }}
                  >
                    Saves{" "}
                    {statsSortColumn === "saves" &&
                      (statsSortDirection === "asc" ? "▲" : "▼")}
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
                      userSelect: "none",
                    }}
                  >
                    Assists{" "}
                    {statsSortColumn === "assists" &&
                      (statsSortDirection === "asc" ? "▲" : "▼")}
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
                      userSelect: "none",
                    }}
                  >
                    Demos{" "}
                    {statsSortColumn === "demos" &&
                      (statsSortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Record
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRosterTeams.map((team, index) => (
                  <tr
                    key={team.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: "var(--accent)",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Image
                          src={team.logoPath}
                          alt={team.name}
                          width={24}
                          height={24}
                          style={{ borderRadius: "4px" }}
                        />
                        <div>
                          <div
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowModal(true);
                            }}
                            style={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              cursor: "pointer",
                              color: "var(--text-main)",
                              transition: "color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "var(--accent)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "var(--text-main)")
                            }
                          >
                            {team.leagueId} {team.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                              marginTop: "0.15rem",
                            }}
                          >
                            vs. - -
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "var(--accent)",
                      }}
                    >
                      {team.displayStats.score > 0
                        ? team.displayStats.score.toFixed(1)
                        : "-"}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "center",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      {team.displayStats.fprk}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      }}
                    >
                      {team.displayStats.fpts.toFixed(1)}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {team.displayStats.avg.toFixed(1)}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {team.displayStats.last.toFixed(1)}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontSize: "0.9rem",
                      }}
                    >
                      {team.displayStats.goals}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontSize: "0.9rem",
                      }}
                    >
                      {team.displayStats.shots}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontSize: "0.9rem",
                      }}
                    >
                      {team.displayStats.saves}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontSize: "0.9rem",
                      }}
                    >
                      {team.displayStats.assists}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        fontSize: "0.9rem",
                      }}
                    >
                      {team.displayStats.demos}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "center",
                        fontSize: "0.9rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {team.displayStats.teamRecord}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Waivers Tab */}
      {activeTab === "waivers" && (
        <section className="card">
          <div style={{ padding: "1.5rem", minHeight: "300px" }}>
            <div
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                padding: "3rem",
              }}
            >
              No pending waiver claims
            </div>
          </div>
        </section>
      )}

      {/* Trades Tab */}
      {activeTab === "trades" && (
        <section className="card">
          <div style={{ padding: "1.5rem", minHeight: "300px" }}>
            {tradesLoading ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "3rem",
                }}
              >
                Loading trades...
              </div>
            ) : trades.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "3rem",
                }}
              >
                No trades found
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {trades.filter(trade => trade.status === "pending").map((trade) => (
                  <div
                    key={trade.id}
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "1.5rem",
                    }}
                  >
                    {/* Trade Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color:
                              trade.status === "pending"
                                ? "#fbbf24"
                                : trade.status === "accepted"
                                ? "#22c55e"
                                : trade.status === "rejected"
                                ? "#ef4444"
                                : "var(--text-muted)",
                            textTransform: "uppercase",
                          }}
                        >
                          {trade.status}
                        </span>
                        <span
                          style={{
                            marginLeft: "1rem",
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {new Date(trade.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Trade Details */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: "2rem",
                        alignItems: "center",
                      }}
                    >
                      {/* Proposer Side */}
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {trade.isProposer ? "You give" : `${trade.proposer.managerName} gives`}
                        </div>
                        <div
                          style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "var(--text-main)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {trade.proposer.teamName}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                          }}
                        >
                          {trade.proposer.gives.map((team: any) => (
                            <div
                              key={team.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem",
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: "6px",
                              }}
                            >
                              <Image
                                src={team.logoPath}
                                alt={team.name}
                                width={32}
                                height={32}
                                style={{ borderRadius: "4px" }}
                              />
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTeam(team);
                                  setShowModal(true);
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "var(--accent)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "var(--text-main)")
                                }
                                style={{
                                  fontSize: "0.9rem",
                                  color: "var(--text-main)",
                                  cursor: "pointer",
                                  transition: "color 0.2s",
                                }}
                              >
                                {team.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div
                        style={{
                          fontSize: "2rem",
                          color: "var(--accent)",
                          fontWeight: 700,
                        }}
                      >
                        ⇄
                      </div>

                      {/* Receiver Side */}
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {trade.isProposer ? `${trade.receiver.managerName} gives` : "You give"}
                        </div>
                        <div
                          style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "var(--text-main)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {trade.receiver.teamName}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                          }}
                        >
                          {trade.receiver.gives.map((team: any) => (
                            <div
                              key={team.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem",
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: "6px",
                              }}
                            >
                              <Image
                                src={team.logoPath}
                                alt={team.name}
                                width={32}
                                height={32}
                                style={{ borderRadius: "4px" }}
                              />
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTeam(team);
                                  setShowModal(true);
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "var(--accent)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "var(--text-main)")
                                }
                                style={{
                                  fontSize: "0.9rem",
                                  color: "var(--text-main)",
                                  cursor: "pointer",
                                  transition: "color 0.2s",
                                }}
                              >
                                {team.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Pending Trades */}
                    {trade.status === "pending" && !trade.isProposer && (
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          marginTop: "1.5rem",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `/api/leagues/${leagueId}/trades/${trade.id}`,
                                {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ action: "reject" }),
                                }
                              );

                              if (response.ok) {
                                // Refresh trades
                                const tradesResponse = await fetch(
                                  `/api/leagues/${leagueId}/trades?teamId=${teamId}`
                                );
                                if (tradesResponse.ok) {
                                  const data = await tradesResponse.json();
                                  setTrades(data.trades || []);
                                }
                              }
                            } catch (error) {
                              console.error("Error rejecting trade:", error);
                            }
                          }}
                          style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            border: "1px solid #ef4444",
                            color: "#ef4444",
                            padding: "0.5rem 1.5rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={async () => {
                            // Store the original trade ID to reject after counter offer
                            sessionStorage.setItem("counterTradeId", trade.id);
                            sessionStorage.setItem("counterTradeLeagueId", leagueId);
                            sessionStorage.setItem("counterTradeTeamId", teamId || "");

                            // Navigate to trade page with the proposer's team
                            window.location.href = `/leagues/${leagueId}/opponents/${trade.proposer.teamId}/trade`;
                          }}
                          style={{
                            background: "rgba(251, 191, 36, 0.2)",
                            border: "1px solid #fbbf24",
                            color: "#fbbf24",
                            padding: "0.5rem 1.5rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          Counter
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `/api/leagues/${leagueId}/trades/${trade.id}`,
                                {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ action: "accept" }),
                                }
                              );

                              if (response.ok) {
                                // Refresh trades
                                const tradesResponse = await fetch(
                                  `/api/leagues/${leagueId}/trades?teamId=${teamId}`
                                );
                                if (tradesResponse.ok) {
                                  const data = await tradesResponse.json();
                                  setTrades(data.trades || []);
                                }
                              }
                            } catch (error) {
                              console.error("Error accepting trade:", error);
                            }
                          }}
                          style={{
                            background: "rgba(34, 197, 94, 0.2)",
                            border: "1px solid #22c55e",
                            color: "#22c55e",
                            padding: "0.5rem 1.5rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Drop Modal */}
      {showDropModal && (
        <div
          onClick={() => {
            setShowDropModal(false);
            setSelectedDropSlot(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 90,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(800px, 90vw)",
              background: "linear-gradient(135deg, #1a2332 0%, #0f1419 100%)",
              border: "2px solid rgba(242, 182, 50, 0.3)",
              borderRadius: "16px",
              padding: "0",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
              position: "relative",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowDropModal(false);
                setSelectedDropSlot(null);
              }}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "1.2rem",
                fontWeight: 700,
                zIndex: 10,
              }}
            >
              ×
            </button>

            {/* Header */}
            <div
              style={{
                padding: "2rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  margin: 0,
                }}
              >
                Drop a Team
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}
              >
                Select a team from your roster to drop
              </p>
            </div>

            {/* Roster List */}
            <div style={{ padding: "1.5rem 2rem" }}>
              {fullRoster.filter((slot) => slot.mleTeam !== null).length ===
              0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "var(--text-muted)",
                  }}
                >
                  No teams to drop
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {fullRoster
                    .filter((slot) => slot.mleTeam !== null)
                    .map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() =>
                          setSelectedDropSlot(
                            selectedDropSlot?.id === slot.id ? null : slot
                          )
                        }
                        style={{
                          padding: "1rem",
                          background:
                            selectedDropSlot?.id === slot.id
                              ? "rgba(242, 182, 50, 0.1)"
                              : "rgba(255, 255, 255, 0.05)",
                          border: `2px solid ${
                            selectedDropSlot?.id === slot.id
                              ? "var(--accent)"
                              : "rgba(255, 255, 255, 0.1)"
                          }`,
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <Image
                          src={slot.mleTeam!.logoPath}
                          alt={slot.mleTeam!.name}
                          width={48}
                          height={48}
                          style={{ borderRadius: "6px" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "var(--text-main)",
                            }}
                          >
                            {slot.mleTeam!.leagueId} {slot.mleTeam!.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-muted)",
                              marginTop: "0.25rem",
                            }}
                          >
                            {slot.position === "be" || slot.position === "flx" ? slot.position.toUpperCase() : slot.position} ·{" "}
                            {slot.fantasyPoints?.toFixed(1) || 0} pts
                          </div>
                        </div>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            border: "2px solid var(--accent)",
                            borderRadius: "4px",
                            background:
                              selectedDropSlot?.id === slot.id
                                ? "var(--accent)"
                                : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color:
                              selectedDropSlot?.id === slot.id
                                ? "#1a1a2e"
                                : "transparent",
                            fontWeight: 700,
                            fontSize: "1rem",
                          }}
                        >
                          ✓
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                padding: "1.5rem 2rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowDropModal(false);
                  setSelectedDropSlot(null);
                }}
                className="btn btn-ghost"
                style={{ fontSize: "1rem" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedDropSlot || !rosterData) {
                    alert("Please select a team to drop");
                    return;
                  }

                  try {
                    const response = await fetch(
                      `/api/leagues/${leagueId}/rosters/${teamId}`,
                      {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          rosterSlotId: selectedDropSlot.id,
                        }),
                      }
                    );

                    if (response.ok) {
                      alert(
                        `${
                          selectedDropSlot.mleTeam!.name
                        } has been dropped from your roster`
                      );
                      setShowDropModal(false);
                      setSelectedDropSlot(null);
                      // Refetch roster
                      const rosterResponse = await fetch(
                        `/api/leagues/${leagueId}/rosters/${teamId}?week=${currentWeek}`
                      );
                      if (rosterResponse.ok) {
                        const updatedRoster = await rosterResponse.json();
                        setRosterData(updatedRoster);
                      }
                    } else {
                      const error = await response.json();
                      alert(
                        `Failed to drop team: ${error.error || "Unknown error"}`
                      );
                    }
                  } catch (error) {
                    console.error("Error dropping team:", error);
                    alert("Failed to drop team. Please try again.");
                  }
                }}
                disabled={!selectedDropSlot}
                style={{
                  background: selectedDropSlot
                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                    : "rgba(128, 128, 128, 0.3)",
                  color: selectedDropSlot
                    ? "white"
                    : "rgba(255, 255, 255, 0.5)",
                  fontWeight: 700,
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: selectedDropSlot ? "pointer" : "not-allowed",
                  fontSize: "1rem",
                  boxShadow: selectedDropSlot
                    ? "0 4px 12px rgba(239, 68, 68, 0.3)"
                    : "none",
                }}
              >
                Drop Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showModal && selectedTeam && (
        <TeamModal
          team={selectedTeam}
          onClose={() => {
            setShowModal(false);
            setSelectedTeam(null);
          }}
          isDraftContext={false}
        />
      )}
    </>
  );
}
