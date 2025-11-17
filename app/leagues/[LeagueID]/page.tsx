"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
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

// Select 8 teams from TEAMS with stats
// Static values to prevent hydration errors (no Math.random())
const selectedTeams = TEAMS.slice(0, 8).map((team, index) => {
  const opponentGameRecords = ["10-15", "8-17", "12-10", "5-18", "7-15", "9-13", "11-11", "6-16"];
  const opponentFantasyRanks = [1, 18, 5, 28, 14, 8, 10, 26];

  return {
    ...team,
    slot: index < 2 ? "2s" : index < 4 ? "3s" : index === 4 ? "FLX" : "BE",
    score: index < 5 ? (45 - index * 1.5) : 0,
    opponentTeam: TEAMS[(index * 7) % TEAMS.length],
    oprk: (index * 3) % 10 + 1,
    fprk: index + 1,
    fpts: 380 - index * 10,
    avg: 50 - index * 2,
    last: 48 - index * 2.5,
    goals: 140 - index * 5,
    shots: 750 - index * 20,
    saves: 220 - index * 10,
    assists: 95 - index * 5,
    demos: 55 - index * 3,
    teamRecord: `${6 - Math.floor(index / 2)}-${2 + Math.floor(index / 2)}`,
    rank: index + 1,
    record: `${6 - Math.floor(index / 2)}-${2 + Math.floor(index / 2)}`,
    status: "free-agent" as const,
    opponentGameRecord: opponentGameRecords[index],
    opponentFantasyRank: opponentFantasyRanks[index]
  };
});

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

// Mock waiver data - filtered to show only user's transactions
const mockMyWaivers = {
  pending: [
    {
      id: 1,
      team: "Storm Surge",
      timestamp: "Nov 14, 2025 11:23 PM",
      status: "Pending",
    },
  ],
  history: [
    {
      id: 1,
      team: "Lightning Bolts",
      timestamp: "Nov 7, 2025 3:45 AM",
      status: "Processed",
      result: "Successful",
    },
    {
      id: 2,
      team: "Ice Wolves",
      timestamp: "Nov 1, 2025 3:45 AM",
      status: "Processed",
      result: "Failed - Lower Priority",
    },
  ],
};

// Mock trade data - filtered to show only user's transactions
const mockMyTrades = {
  pending: [
    {
      id: 1,
      teamFrom: "Fantastic Ballers",
      teamFromManager: "xenn",
      teamFromStats: "2 - 1  3rd",
      teamFromReceives: ["AL Blizzard", "AL Comets"],
      teamTo: "Pixies",
      teamToManager: "Crazy",
      teamToStats: "0 - 3  9th",
      teamToReceives: ["AL Bulls"],
      proposed: "11/15/2025 7:43",
      expires: "11/17/2025 7:43",
      timestamp: "Nov 14, 2025 11:23 PM",
    },
    {
      id: 2,
      teamFrom: "Fantastic Ballers",
      teamFromManager: "xenn",
      teamFromStats: "2 - 1  3rd",
      teamFromReceives: ["ML Phoenix"],
      teamTo: "Whiffers",
      teamToManager: "Omegz",
      teamToStats: "1 - 2  6th",
      teamToReceives: ["CL Storm"],
      proposed: "11/13/2025 9:45",
      expires: "11/15/2025 9:45",
      timestamp: "Nov 13, 2025 9:45 PM",
    },
  ],
  history: [
    {
      id: 1,
      teamFrom: "Fantastic Ballers",
      teamFromStats: "xEPR: 2 - 1  3rd",
      teamTo: "Pixies",
      teamToStats: "Creavy: 0 - 3  9th",
      timestamp: "Nov 1, 2025 2:30 PM",
      status: "Rejected",
    },
  ],
};

export default function MyRosterPage() {
  const router = useRouter();
  const params = useParams();
  const roster = mockRoster;
  const [currentWeek, setCurrentWeek] = useState(roster.currentWeek);

  // Helper functions for week navigation (weeks 1-10)
  const getNextWeek = (week: number) => {
    if (week >= 10) return 10;
    return week + 1;
  };

  const getPrevWeek = (week: number) => {
    if (week <= 1) return 1;
    return week - 1;
  };
  const [activeTab, setActiveTab] = useState<"lineup" | "stats" | "waivers" | "trades">("lineup");
  const [selectedTeam, setSelectedTeam] = useState<typeof selectedTeams[0] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<typeof mockMyTrades.pending[0] | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [selectedWaiverTeam, setSelectedWaiverTeam] = useState<typeof selectedTeams[0] | null>(null);
  const [selectedDropTeam, setSelectedDropTeam] = useState<string | null>(null);
  const [showDropModal, setShowDropModal] = useState(false);
  const [teamToDrop, setTeamToDrop] = useState<typeof selectedTeams[0] | null>(null);
  const [showTradeDropModal, setShowTradeDropModal] = useState(false);
  const [selectedTradeDropTeam, setSelectedTradeDropTeam] = useState<string | null>(null);
  const [moveMode, setMoveMode] = useState(false);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);
  const [teams, setTeams] = useState(selectedTeams);
  const [showAcceptConfirmModal, setShowAcceptConfirmModal] = useState(false);
  const [showDeclineConfirmModal, setShowDeclineConfirmModal] = useState(false);

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
    return [...roster.teams].sort((a, b) => {
      const aValue = a[statsSortColumn];
      const bValue = b[statsSortColumn];
      if (statsSortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [statsSortColumn, statsSortDirection, roster.teams]);

  const handleScheduleClick = () => {
    router.push(`/leagues/${params.LeagueID}/schedule`);
  };

  const handleTransactionsClick = () => {
    router.push(`/leagues/${params.LeagueID}/my-roster/${params.LeagueID}/transactions`);
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
      const newTeams = [...teams];
      const team1Slot = newTeams[selectedTeamIndex].slot;
      const team2Slot = newTeams[index].slot;

      // Swap the entire team objects
      const temp = newTeams[selectedTeamIndex];
      newTeams[selectedTeamIndex] = newTeams[index];
      newTeams[index] = temp;

      // Restore the original slots
      newTeams[selectedTeamIndex] = { ...newTeams[selectedTeamIndex], slot: team1Slot };
      newTeams[index] = { ...newTeams[index], slot: team2Slot };

      setTeams(newTeams);
      setSelectedTeamIndex(null);
    }
  };

  return (
    <>
      {/* Team Stats Modal */}
      <TeamModal
        team={showModal && selectedTeam ? {
          ...selectedTeam,
          rosteredBy: selectedTeam.rank % 2 === 0 ? { rosterName: "Fantastic Ballers", managerName: "xenn" } : undefined
        } : null}
        onClose={() => setShowModal(false)}
      />

      {/* Trade Modal */}
      {showTradeModal && selectedTrade && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
          }}
          onClick={() => setShowTradeModal(false)}
        >
          <div
            style={{
              width: "min(800px, 92vw)",
              background: "linear-gradient(135deg, #1a2332 0%, #0f1419 100%)",
              border: "2px solid rgba(242, 182, 50, 0.3)",
              borderRadius: "16px",
              padding: "0",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowTradeModal(false)}
              style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
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
              }}
            >
              ×
            </button>

            {/* Header with Proposed/Expires */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "3rem",
                padding: "1.5rem 2rem 1rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                  Proposed:
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)" }}>
                  {selectedTrade.proposed}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                  Expires:
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)" }}>
                  {selectedTrade.expires}
                </div>
              </div>
            </div>

            {/* Trade Details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                padding: "2rem",
              }}
            >
              {/* Left Side - Team From */}
              <div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                    {selectedTrade.teamFrom}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {selectedTrade.teamFromManager}
                  </div>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {selectedTrade.teamFromStats}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Receives
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedTrade.teamFromReceives.map((team, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {team}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Team To */}
              <div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                    {selectedTrade.teamTo}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {selectedTrade.teamToManager}
                  </div>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {selectedTrade.teamToStats}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Receives
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedTrade.teamToReceives.map((team, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {team}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                padding: "1.5rem 2rem 2rem",
                justifyContent: "center",
              }}
            >
              <button
                style={{
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  color: "white",
                  fontWeight: 700,
                  padding: "0.75rem 2.5rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                }}
                onClick={() => setShowAcceptConfirmModal(true)}
              >
                Accept
              </button>
              <button
                style={{
                  background: "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)",
                  color: "#1a1a2e",
                  fontWeight: 700,
                  padding: "0.75rem 2.5rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(242, 182, 50, 0.3)",
                }}
                onClick={() => {
                  // Cancel/decline the trade and navigate to trade page
                  const leagueId = params?.LeagueID as string;
                  // Get the opponent's manager ID - need to determine from trade data
                  // For now, navigate to opponents page to select manager
                  setShowTradeModal(false);
                  router.push(`/leagues/${leagueId}/opponents`);
                }}
              >
                Counter-Offer
              </button>
              <button
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  fontWeight: 700,
                  padding: "0.75rem 2.5rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                }}
                onClick={() => setShowDeclineConfirmModal(true)}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Trade Confirmation Modal */}
      {showAcceptConfirmModal && selectedTrade && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 90,
          }}
          onClick={() => setShowAcceptConfirmModal(false)}
        >
          <div
            style={{
              width: "min(500px, 92vw)",
              background: "linear-gradient(135deg, #1a2332 0%, #0f1419 100%)",
              border: "2px solid rgba(242, 182, 50, 0.3)",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Accept Trade?
            </h2>

            {/* Trade Summary */}
            <div
              style={{
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", textAlign: "center" }}>
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{selectedTrade.teamFrom}</span>
                {" ↔ "}
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{selectedTrade.teamTo}</span>
              </div>
            </div>

            {/* Confirmation Text */}
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-muted)",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              Are you sure you want to accept this trade?
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "var(--text-main)",
                  fontWeight: 600,
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
                onClick={() => setShowAcceptConfirmModal(false)}
              >
                No, Go Back
              </button>
              <button
                style={{
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  color: "white",
                  fontWeight: 700,
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                }}
                onClick={() => {
                  // Check if accepting this trade means receiving more teams than giving
                  const isNonEqualTrade = selectedTrade.teamFromReceives.length > selectedTrade.teamToReceives.length;

                  setShowAcceptConfirmModal(false);

                  if (isNonEqualTrade) {
                    // Show drop modal to select a team to drop
                    setShowTradeDropModal(true);
                  } else {
                    // Equal trade, complete it
                    alert("Trade accepted!");
                    setShowTradeModal(false);
                  }
                }}
              >
                Yes, Accept Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Trade Confirmation Modal */}
      {showDeclineConfirmModal && selectedTrade && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 90,
          }}
          onClick={() => setShowDeclineConfirmModal(false)}
        >
          <div
            style={{
              width: "min(500px, 92vw)",
              background: "linear-gradient(135deg, #1a2332 0%, #0f1419 100%)",
              border: "2px solid rgba(242, 182, 50, 0.3)",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Decline Trade?
            </h2>

            {/* Trade Summary */}
            <div
              style={{
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", textAlign: "center" }}>
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{selectedTrade.teamFrom}</span>
                {" ↔ "}
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{selectedTrade.teamTo}</span>
              </div>
            </div>

            {/* Confirmation Text */}
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-muted)",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              Are you sure you want to decline this trade?
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "var(--text-main)",
                  fontWeight: 600,
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
                onClick={() => setShowDeclineConfirmModal(false)}
              >
                No, Go Back
              </button>
              <button
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  fontWeight: 700,
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                }}
                onClick={() => {
                  alert("Trade declined!");
                  setShowDeclineConfirmModal(false);
                  setShowTradeModal(false);
                }}
              >
                Yes, Decline Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Accept Drop Modal - appears if accepting non-equal trade */}
      {showTradeDropModal && selectedTrade && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 95,
          }}
          onClick={() => setShowTradeDropModal(false)}
        >
          <div
            style={{
              width: "min(900px, 92vw)",
              background: "linear-gradient(135deg, #1a2332 0%, #0f1419 100%)",
              border: "2px solid rgba(242, 182, 50, 0.3)",
              borderRadius: "16px",
              padding: "0",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowTradeDropModal(false);
                setSelectedTradeDropTeam(null);
              }}
              style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
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

            {/* Confirm button */}
            <button
              onClick={() => {
                if (selectedTradeDropTeam) {
                  alert(`Trade accepted! You will drop ${selectedTradeDropTeam}`);
                  setShowTradeDropModal(false);
                  setShowTradeModal(false);
                  setSelectedTradeDropTeam(null);
                } else {
                  alert("Please select a team to drop");
                }
              }}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "linear-gradient(135deg, var(--accent) 0%, #d4a832 100%)",
                color: "#1a1a2e",
                fontWeight: 700,
                padding: "0.65rem 2rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(242, 182, 50, 0.4)",
                zIndex: 10,
              }}
            >
              Confirm
            </button>

            {/* Header - Team Info */}
            <div style={{ padding: "3.5rem 2rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>
                {roster.teamName}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {roster.managerName}
              </div>
              <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {roster.record.wins} - {roster.record.losses}  {roster.record.place}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--accent)", marginTop: "1rem", fontWeight: 600 }}>
                Select a team to drop (You&apos;re receiving more teams than you&apos;re sending)
              </div>
            </div>

            {/* Roster Table with Radio Buttons */}
            <div style={{ padding: "1.5rem 2rem" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.2)" }}>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Slot</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fpts</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          backgroundColor: selectedTradeDropTeam === team.name ? "rgba(242, 182, 50, 0.1)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "var(--accent)" }}>
                          {team.slot}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Image
                              src={team.logoPath}
                              alt={team.name}
                              width={24}
                              height={24}
                              style={{ borderRadius: "4px" }}
                            />
                            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>
                              {team.leagueId} {team.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600, fontSize: "0.9rem" }}>
                          {team.fpts.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                          {team.teamRecord}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                          {team.fprk}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          <button
                            onClick={() => setSelectedTradeDropTeam(team.name)}
                            style={{
                              width: "24px",
                              height: "24px",
                              border: "2px solid var(--accent)",
                              borderRadius: "4px",
                              background: selectedTradeDropTeam === team.name ? "var(--accent)" : "transparent",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: selectedTradeDropTeam === team.name ? "#1a1a2e" : "transparent",
                              fontWeight: 700,
                              fontSize: "1rem",
                            }}
                          >
                            ✓
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waiver Claim Modal */}
      {console.log("showWaiverModal:", showWaiverModal, "selectedWaiverTeam:", selectedWaiverTeam)}
      {showWaiverModal && selectedWaiverTeam && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
          }}
          onClick={() => setShowWaiverModal(false)}
        >
          <div
            style={{
              width: "min(900px, 92vw)",
              background: "linear-gradient(135deg, #1a2332 0%, #0f1419 100%)",
              border: "2px solid rgba(242, 182, 50, 0.3)",
              borderRadius: "16px",
              padding: "0",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowWaiverModal(false);
                setSelectedWaiverTeam(null);
                setSelectedDropTeam(null);
              }}
              style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
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

            {/* Submit button */}
            <button
              onClick={() => {
                if (selectedDropTeam) {
                  alert(`Waiver claim submitted! Adding ${selectedWaiverTeam.name} and dropping ${selectedDropTeam}`);
                  setShowWaiverModal(false);
                  setSelectedWaiverTeam(null);
                  setSelectedDropTeam(null);
                } else {
                  alert("Please select a team to drop");
                }
              }}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "linear-gradient(135deg, var(--accent) 0%, #d4a832 100%)",
                color: "#1a1a2e",
                fontWeight: 700,
                padding: "0.65rem 2rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(242, 182, 50, 0.4)",
                zIndex: 10,
              }}
            >
              Submit
            </button>

            {/* Header - Team Info */}
            <div style={{ padding: "3.5rem 2rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>
                {roster.teamName}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {roster.managerName}
              </div>
              <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {roster.record.wins} - {roster.record.losses}  {roster.record.place}
              </div>
            </div>

            {/* Selected Waiver Team */}
            <div
              style={{
                padding: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Image
                src={selectedWaiverTeam.logoPath}
                alt={selectedWaiverTeam.name}
                width={80}
                height={80}
                style={{ borderRadius: "8px" }}
              />
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-main)" }}>
                {selectedWaiverTeam.leagueId} {selectedWaiverTeam.name}
              </div>
            </div>

            {/* Roster Table with Checkboxes */}
            <div style={{ padding: "1.5rem 2rem" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.2)" }}>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fpts</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Last</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Goals</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Shots</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Saves</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Assists</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Demos</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.teams.map((team, index) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          backgroundColor: selectedDropTeam === team.name ? "rgba(242, 182, 50, 0.1)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "var(--accent)" }}>
                          {team.slot}
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
                            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>
                              {team.leagueId} {team.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600, fontSize: "0.9rem" }}>
                          {team.fpts.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                          {team.avg.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                          {team.last.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.goals}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.shots}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.saves}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.assists}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.demos}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                          {team.teamRecord}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          <button
                            onClick={() => setSelectedDropTeam(selectedDropTeam === team.name ? null : team.name)}
                            style={{
                              width: "24px",
                              height: "24px",
                              border: "2px solid var(--accent)",
                              borderRadius: "4px",
                              background: selectedDropTeam === team.name ? "var(--accent)" : "transparent",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: selectedDropTeam === team.name ? "#1a1a2e" : "transparent",
                              fontWeight: 700,
                              fontSize: "1rem",
                            }}
                          >
                            ✓
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drop Modal */}
      {showDropModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
          }}
          onClick={() => setShowDropModal(false)}
        >
          <div
            style={{
              width: "min(900px, 92vw)",
              background: "linear-gradient(135deg, #1a2332 0%, #0f1419 100%)",
              border: "2px solid rgba(242, 182, 50, 0.3)",
              borderRadius: "16px",
              padding: "0",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowDropModal(false);
                setTeamToDrop(null);
              }}
              style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
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

            {/* Confirm button */}
            <button
              onClick={() => {
                if (teamToDrop) {
                  alert(`Dropped ${teamToDrop.name}`);
                  setShowDropModal(false);
                  setTeamToDrop(null);
                } else {
                  alert("Please select a team to drop");
                }
              }}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "linear-gradient(135deg, var(--accent) 0%, #d4a832 100%)",
                color: "#1a1a2e",
                fontWeight: 700,
                padding: "0.65rem 2rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(242, 182, 50, 0.4)",
                zIndex: 10,
              }}
            >
              Confirm
            </button>

            {/* Header - Team Info */}
            <div style={{ padding: "3.5rem 2rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>
                {roster.teamName}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {roster.managerName}
              </div>
              <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {roster.record.wins} - {roster.record.losses}  {roster.record.place}
              </div>
            </div>

            {/* Roster Table with Checkboxes */}
            <div style={{ padding: "1.5rem 2rem" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.2)" }}>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fpts</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Last</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Goals</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Shots</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Saves</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Assists</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Demos</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.teams.map((team, index) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          backgroundColor: teamToDrop?.name === team.name ? "rgba(242, 182, 50, 0.1)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "var(--accent)" }}>
                          {team.slot}
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
                            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>
                              {team.leagueId} {team.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600, fontSize: "0.9rem" }}>
                          {team.fpts.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                          {team.avg.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                          {team.last.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.goals}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.shots}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.saves}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.assists}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.9rem" }}>
                          {team.demos}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                          {team.teamRecord}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          <button
                            onClick={() => setTeamToDrop(teamToDrop?.name === team.name ? null : team)}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              background: teamToDrop?.name === team.name ? "var(--accent)" : "transparent",
                              border: `2px solid ${teamToDrop?.name === team.name ? "var(--accent)" : "rgba(255, 255, 255, 0.3)"}`,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                              padding: 0,
                            }}
                          >
                            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: teamToDrop?.name === team.name ? "#1a1a2e" : "transparent" }}>
                              ✓
                            </span>
                          </button>
                        </td>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>Roster</h1>
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
              cursor: "pointer"
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
              cursor: "pointer"
            }}
          >
            Transactions
          </button>
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
            <div style={{ marginTop: "0.75rem", fontSize: "0.95rem", color: "var(--text-muted)" }}>
              Waiver Priority: <span style={{ fontWeight: 600, color: "var(--text-main)" }}>#3</span>
            </div>
          </div>

          {/* Matchup Info */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {/* Last Matchup */}
            <div
              onClick={() => router.push(`/leagues/${params.LeagueID}/scoreboard?matchup=1&week=${roster.currentWeek - 1}`)}
              style={{
                textAlign: "center",
                cursor: "pointer",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                transition: "all 0.2s",
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(242, 182, 50, 0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
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
            <div
              onClick={() => router.push(`/leagues/${params.LeagueID}/scoreboard?matchup=1`)}
              style={{
                textAlign: "center",
                cursor: "pointer",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                transition: "all 0.2s",
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(242, 182, 50, 0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
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
        <button
          onClick={() => setActiveTab("waivers")}
          className={activeTab === "waivers" ? "btn btn-primary" : "btn btn-ghost"}
          style={{ fontSize: "1rem" }}
        >
          Waivers
        </button>
        <button
          onClick={() => setActiveTab("trades")}
          className={activeTab === "trades" ? "btn btn-primary" : "btn btn-ghost"}
          style={{ fontSize: "1rem" }}
        >
          Trades
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
                onClick={() => setCurrentWeek(prev => getPrevWeek(prev))}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
                disabled={currentWeek === 1}
              >
                ◄ Week {getPrevWeek(currentWeek)}
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                Week {currentWeek}
              </span>
              <button
                onClick={() => setCurrentWeek(prev => getNextWeek(prev))}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
                disabled={currentWeek === 10}
              >
                Week {getNextWeek(currentWeek)} ►
              </button>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => router.push(`/leagues/${params.LeagueID}/team-portal`)}
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
          </div>

          {/* Move Mode Instructions */}
          {moveMode && (
            <div style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "rgba(242, 182, 50, 0.1)",
              borderBottom: "1px solid rgba(242, 182, 50, 0.3)",
              color: "var(--accent)",
              fontSize: "0.9rem",
              fontWeight: 600,
              textAlign: "center"
            }}>
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
                {teams.map((team, index) => (
                  <tr
                    key={index}
                    onClick={() => handleTeamClick(index)}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      backgroundColor: selectedTeamIndex === index
                        ? "rgba(242, 182, 50, 0.2)"
                        : team.slot === "BE"
                        ? "rgba(255,255,255,0.02)"
                        : "transparent",
                      borderTop: team.slot === "BE" && index === 5 ? "2px solid rgba(255,255,255,0.15)" : "none",
                      cursor: moveMode ? "pointer" : "default",
                      transition: "background-color 0.2s",
                      borderLeft: selectedTeamIndex === index ? "3px solid var(--accent)" : "3px solid transparent"
                    }}
                    onMouseEnter={(e) => {
                      if (moveMode && selectedTeamIndex !== index) {
                        e.currentTarget.style.backgroundColor = "rgba(242, 182, 50, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (moveMode && selectedTeamIndex !== index) {
                        e.currentTarget.style.backgroundColor = team.slot === "BE" ? "rgba(255,255,255,0.02)" : "transparent";
                      }
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
                        <div>
                          <div
                            onClick={(e) => {
                              if (!moveMode) {
                                e.stopPropagation();
                                setSelectedTeam(team);
                                setShowModal(true);
                              }
                            }}
                            style={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              cursor: moveMode ? "default" : "pointer",
                              color: "var(--text-main)",
                              transition: "color 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              if (!moveMode) {
                                e.currentTarget.style.color = "var(--accent)";
                              }
                            }}
                            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                          >
                            {team.leagueId} {team.name}
                          </div>
                          {team.opponentTeam && team.opponentGameRecord && team.opponentFantasyRank && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                              vs. {team.opponentTeam.leagueId} {team.opponentTeam.name} {team.opponentGameRecord}{" "}
                              <span style={{ color: getFantasyRankColor(team.opponentFantasyRank) }}>
                                ({team.opponentFantasyRank}
                                {team.opponentFantasyRank === 1 ? "st" :
                                 team.opponentFantasyRank === 2 ? "nd" :
                                 team.opponentFantasyRank === 3 ? "rd" : "th"})
                              </span>
                            </div>
                          )}
                        </div>
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
                      {team.opponentTeam?.name || "-"}
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
                onClick={() => setCurrentWeek(prev => getPrevWeek(prev))}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
                disabled={currentWeek === 1}
              >
                ◄ Week {getPrevWeek(currentWeek)}
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                Week {currentWeek}
              </span>
              <button
                onClick={() => setCurrentWeek(prev => getNextWeek(prev))}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
                disabled={currentWeek === 10}
              >
                Week {getNextWeek(currentWeek)} ►
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
                {sortedRosterTeams.map((team, index) => (
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
                                transition: "color 0.2s"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                            >
                              {team.leagueId} {team.name}
                            </div>
                            {team.opponentTeam && team.opponentGameRecord && team.opponentFantasyRank && (
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                                vs. {team.opponentTeam.leagueId} {team.opponentTeam.name} {team.opponentGameRecord}{" "}
                                <span style={{ color: getFantasyRankColor(team.opponentFantasyRank) }}>
                                  ({team.opponentFantasyRank}
                                  {team.opponentFantasyRank === 1 ? "st" :
                                   team.opponentFantasyRank === 2 ? "nd" :
                                   team.opponentFantasyRank === 3 ? "rd" : "th"})
                                </span>
                              </div>
                            )}
                          </div>
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

      {/* Waivers Tab */}
      {activeTab === "waivers" && (
        <section className="card">
          <div style={{ padding: "1.5rem", minHeight: "300px" }}>
            {mockMyWaivers.pending.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                No pending waiver claims
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {mockMyWaivers.pending.map((waiver) => {
                  // Find the team being claimed - using mock data
                  const claimingTeam = selectedTeams.find(t => t.name === "Storm Surge") || selectedTeams[1];
                  // Find the team being dropped - using mock data
                  const droppingTeam = selectedTeams.find(t => t.name === "Comets") || selectedTeams[2];

                  return (
                    <div
                      key={waiver.id}
                      style={{
                        background: "rgba(29, 50, 88, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "1rem 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1.5rem",
                      }}
                    >
                      {/* Team Being Added */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        <Image
                          src={claimingTeam.logoPath}
                          alt={claimingTeam.name}
                          width={48}
                          height={48}
                          style={{ borderRadius: "6px" }}
                        />
                        <div>
                          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>
                            {claimingTeam.leagueId} {claimingTeam.name}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            4th
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div style={{ fontSize: "1.5rem", color: "var(--accent)", fontWeight: 700 }}>
                        →
                      </div>

                      {/* Team Being Dropped */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        <Image
                          src={droppingTeam.logoPath}
                          alt={droppingTeam.name}
                          width={48}
                          height={48}
                          style={{ borderRadius: "6px" }}
                        />
                        <div>
                          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>
                            {droppingTeam.leagueId} {droppingTeam.name}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            (9th)
                          </div>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      <button
                        onClick={() => {
                          alert("Waiver claim cancelled");
                        }}
                        style={{
                          background: "var(--accent)",
                          color: "#1a1a2e",
                          fontWeight: 600,
                          padding: "0.5rem 1.5rem",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Trades Tab */}
      {activeTab === "trades" && (
        <section className="card">
          <div style={{ padding: "1.5rem", minHeight: "300px" }}>
            {mockMyTrades.pending.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                No pending trades
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {mockMyTrades.pending.map((trade) => (
                  <div
                    key={trade.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                      padding: "1.25rem",
                      background: "rgba(19, 31, 58, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    {/* Team From */}
                    <div style={{ flex: "1" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "0.25rem" }}>
                        {trade.teamFrom}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {trade.teamFromStats}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div
                      style={{
                        fontSize: "1.5rem",
                        color: "var(--accent)",
                        fontWeight: "700",
                      }}
                    >
                      →
                    </div>

                    {/* Team To */}
                    <div style={{ flex: "1" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "0.25rem" }}>
                        {trade.teamTo}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {trade.teamToStats}
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      style={{
                        background: "var(--accent)",
                        color: "#1f2937",
                        fontWeight: "600",
                        padding: "0.5rem 1.25rem",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                      onClick={() => {
                        setSelectedTrade(trade);
                        setShowTradeModal(true);
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
