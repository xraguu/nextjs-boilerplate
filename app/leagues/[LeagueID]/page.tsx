"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { TEAMS, LEAGUE_COLORS } from "@/lib/teams";
import TeamModal from "@/components/TeamModal";

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
  const [activeTab, setActiveTab] = useState<"lineup" | "stats" | "waivers" | "trades">("lineup");
  const [selectedTeam, setSelectedTeam] = useState<typeof selectedTeams[0] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<typeof mockMyTrades.pending[0] | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [selectedWaiverTeam, setSelectedWaiverTeam] = useState<typeof selectedTeams[0] | null>(null);
  const [selectedDropTeam, setSelectedDropTeam] = useState<string | null>(null);

  const handleScheduleClick = () => {
    router.push(`/leagues/${params.LeagueID}/schedule`);
  };

  const handleTransactionsClick = () => {
    router.push(`/leagues/${params.LeagueID}/my-roster/${params.LeagueID}/transactions`);
  };

  return (
    <>
      {/* Team Stats Modal */}
      <TeamModal team={showModal ? selectedTeam : null} onClose={() => setShowModal(false)} />

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
                  padding: "0.75rem 3rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                }}
                onClick={() => {
                  alert("Trade accepted!");
                  setShowTradeModal(false);
                }}
              >
                Accept
              </button>
              <button
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  fontWeight: 700,
                  padding: "0.75rem 3rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                }}
                onClick={() => {
                  alert("Trade declined!");
                  setShowTradeModal(false);
                }}
              >
                Decline
              </button>
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
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
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
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}></th>
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
                      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                        <button
                          onClick={() => {
                            console.log("Claim button clicked", team);
                            console.log("Setting selectedWaiverTeam and showWaiverModal");
                            setSelectedWaiverTeam(team);
                            setShowWaiverModal(true);
                            console.log("Modal state updated");
                          }}
                          style={{
                            background: "var(--accent)",
                            color: "#1a1a2e",
                            fontWeight: 600,
                            padding: "0.5rem 1rem",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          Claim
                        </button>
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
                {mockMyWaivers.pending.map((waiver) => (
                  <div
                    key={waiver.id}
                    style={{
                      background: "rgba(47, 52, 56, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-main)" }}>
                        {waiver.team}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--accent)",
                          background: "rgba(242, 182, 50, 0.15)",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                        }}
                      >
                        {waiver.status}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{waiver.timestamp}</div>
                  </div>
                ))}
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
