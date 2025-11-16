"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { TEAMS, LEAGUE_COLORS } from "@/lib/teams";
import TeamModal from "@/components/TeamModal";

// Mock team stats and availability
const mockTeamData = TEAMS.map((team, index) => ({
  ...team,
  rank: index + 1,
  fpts: Math.floor(Math.random() * 200 + 300), // Random points between 300-500
  avg: Math.floor(Math.random() * 20 + 35), // Random avg between 35-55
  last: Math.floor(Math.random() * 25 + 30), // Random last between 30-55
  goals: Math.floor(Math.random() * 50 + 100),
  shots: Math.floor(Math.random() * 200 + 600),
  saves: Math.floor(Math.random() * 100 + 150),
  assists: Math.floor(Math.random() * 40 + 60),
  demos: Math.floor(Math.random() * 30 + 30),
  record: `${Math.floor(Math.random() * 6 + 4)}-${Math.floor(Math.random() * 6 + 4)}`,
  status: Math.random() > 0.7 ? "waiver" : "free-agent", // 30% on waivers, 70% free agents
}));

type SortColumn = "fpts" | "avg" | "last" | "goals" | "shots" | "saves" | "assists" | "demos";
type SortDirection = "asc" | "desc";

// Mock roster data for the waiver modal
const mockRoster = {
  managerName: "xenn",
  teamName: "Fantastic Ballers",
  record: { wins: 2, losses: 1, place: "3rd" },
  teams: TEAMS.slice(0, 8).map((team, index) => ({
    ...team,
    slot: index < 2 ? "2s" : index < 4 ? "3s" : index === 4 ? "FLX" : "BE",
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
  }))
};

export default function TeamPortalPage() {
  const [sortColumn, setSortColumn] = useState<SortColumn>("fpts");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTeam, setSelectedTeam] = useState<typeof mockTeamData[0] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [selectedWaiverTeam, setSelectedWaiverTeam] = useState<typeof mockTeamData[0] | null>(null);
  const [selectedDropTeam, setSelectedDropTeam] = useState<string | null>(null);
  const [showFAConfirmModal, setShowFAConfirmModal] = useState(false);
  const [selectedFATeam, setSelectedFATeam] = useState<typeof mockTeamData[0] | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<"All" | "Foundation" | "Academy" | "Champion" | "Master" | "Premier">("All");
  const [modeFilter, setModeFilter] = useState<"Both" | "2s" | "3s">("Both");
  const [leagueFilterOpen, setLeagueFilterOpen] = useState(false);
  const [modeFilterOpen, setModeFilterOpen] = useState(false);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to descending
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const sortedData = useMemo(() => {
    // First filter the data
    let filteredData = [...mockTeamData];

    // Filter by league
    if (leagueFilter !== "All") {
      const leagueMap = {
        "Foundation": "FL",
        "Academy": "AL",
        "Champion": "CL",
        "Master": "ML",
        "Premier": "PL"
      };
      filteredData = filteredData.filter(team => team.leagueId === leagueMap[leagueFilter]);
    }

    // Filter by mode (this won't work with mock data, but ready for database)
    // When database is connected, you would filter by team.mode === "2s" or "3s"

    // Then sort the filtered data
    return filteredData.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [sortColumn, sortDirection, leagueFilter, modeFilter]);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return (
      <span style={{ marginLeft: "0.25rem" }}>
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <>
      {/* Team Stats Modal */}
      <TeamModal
        team={showModal && selectedTeam ? {
          ...selectedTeam,
          rosteredBy: Math.random() > 0.5 ? { rosterName: "Fantastic Ballers", managerName: "xenn" } : undefined
        } : null}
        onClose={() => setShowModal(false)}
      />

      {/* FA Confirmation Modal */}
      {showFAConfirmModal && selectedFATeam && (
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
          onClick={() => setShowFAConfirmModal(false)}
        >
          <div
            style={{
              width: "min(500px, 90vw)",
              background: "linear-gradient(135deg, #1a2332 0%, #0f1419 100%)",
              border: "2px solid rgba(242, 182, 50, 0.3)",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1.5rem", textAlign: "center" }}>
              Confirm Free Agent Pickup
            </h2>

            {/* Team Display */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.5rem",
                padding: "1.5rem",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Image
                src={selectedFATeam.logoPath}
                alt={selectedFATeam.name}
                width={80}
                height={80}
                style={{ borderRadius: "8px" }}
              />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                  {selectedFATeam.leagueId} {selectedFATeam.name}
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  Free Agent
                </div>
              </div>
            </div>

            {/* Confirmation Text */}
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "2rem" }}>
              Are you sure you want to add this free agent to your roster?
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => {
                  setShowFAConfirmModal(false);
                  setSelectedFATeam(null);
                }}
                className="btn btn-ghost"
                style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}
              >
                No, Go Back
              </button>
              <button
                onClick={() => {
                  setShowFAConfirmModal(false);
                  setSelectedWaiverTeam(selectedFATeam);
                  setShowWaiverModal(true);
                  setSelectedFATeam(null);
                }}
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
              >
                Yes, Add Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waiver Claim Modal */}
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
                {mockRoster.teamName}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {mockRoster.managerName}
              </div>
              <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {mockRoster.record.wins} - {mockRoster.record.losses}  {mockRoster.record.place}
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
                    {mockRoster.teams.map((team, index) => (
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
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>
          Teams
        </h1>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* League Filter */}
        <div style={{ position: "relative", width: "200px" }}>
          <button
            onClick={() => setLeagueFilterOpen(!leagueFilterOpen)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "var(--text-main)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>League: {leagueFilter}</span>
            <span>{leagueFilterOpen ? "▲" : "▼"}</span>
          </button>

          {leagueFilterOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "0.5rem",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                borderRadius: "6px",
                padding: "0.5rem 0",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                zIndex: 1000,
              }}
            >
              {["All", "Foundation", "Academy", "Champion", "Master", "Premier"].map((league) => (
                <button
                  key={league}
                  onClick={() => {
                    setLeagueFilter(league as any);
                    setLeagueFilterOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.5rem 1rem",
                    background: league === leagueFilter ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "none",
                    color: "var(--text-main)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (league !== leagueFilter) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {league}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode Filter */}
        <div style={{ position: "relative", width: "150px" }}>
          <button
            onClick={() => setModeFilterOpen(!modeFilterOpen)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "var(--text-main)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Mode: {modeFilter}</span>
            <span>{modeFilterOpen ? "▲" : "▼"}</span>
          </button>

          {modeFilterOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "0.5rem",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                borderRadius: "6px",
                padding: "0.5rem 0",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                zIndex: 1000,
              }}
            >
              {["Both", "2s", "3s"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setModeFilter(mode as any);
                    setModeFilterOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.5rem 1rem",
                    background: mode === modeFilter ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "none",
                    color: "var(--text-main)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (mode !== modeFilter) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Teams Table */}
      <section className="card">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                <th
                  onClick={() => handleSort("rank")}
                  style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Rank<SortIcon column="rank" />
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                <th
                  onClick={() => handleSort("fpts")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Fpts<SortIcon column="fpts" />
                </th>
                <th
                  onClick={() => handleSort("avg")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Avg<SortIcon column="avg" />
                </th>
                <th
                  onClick={() => handleSort("last")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Last<SortIcon column="last" />
                </th>
                <th
                  onClick={() => handleSort("goals")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Goals<SortIcon column="goals" />
                </th>
                <th
                  onClick={() => handleSort("shots")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Shots<SortIcon column="shots" />
                </th>
                <th
                  onClick={() => handleSort("saves")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Saves<SortIcon column="saves" />
                </th>
                <th
                  onClick={() => handleSort("assists")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Assists<SortIcon column="assists" />
                </th>
                <th
                  onClick={() => handleSort("demos")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Demos<SortIcon column="demos" />
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((team, index) => (
                <tr
                  key={team.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Image
                        src={team.logoPath}
                        alt={`${team.name} logo`}
                        width={32}
                        height={32}
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
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.95rem" }}>
                    {team.fpts}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {team.avg}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {team.last}
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
                    {team.record}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    {team.status === "free-agent" ? (
                      <button
                        className="btn btn-warning"
                        style={{
                          fontSize: "0.85rem",
                          padding: "0.4rem 0.9rem"
                        }}
                        onClick={() => {
                          setSelectedFATeam(team);
                          setShowFAConfirmModal(true);
                        }}
                      >
                        + Add
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost"
                        style={{
                          fontSize: "0.85rem",
                          padding: "0.4rem 0.9rem"
                        }}
                        onClick={() => {
                          setSelectedWaiverTeam(team);
                          setShowWaiverModal(true);
                        }}
                      >
                        Claim
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
