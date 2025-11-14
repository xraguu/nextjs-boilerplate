"use client";

import { useState } from "react";
import { TEAMS } from "@/lib/teams";
import TeamModal from "@/components/TeamModal";

// Mock managers data (11 other managers besides yourself)
const otherManagers = [
  { id: "manager-1", name: "Mike", teamName: "Thunder Strikers", record: "3-0", place: "1st", totalPoints: 612, avgPoints: 204 },
  { id: "manager-2", name: "Sarah", teamName: "Ice Warriors", record: "1-2", place: "7th", totalPoints: 543, avgPoints: 181 },
  { id: "manager-3", name: "Jake", teamName: "Fire Dragons", record: "2-1", place: "4th", totalPoints: 576, avgPoints: 192 },
  { id: "manager-4", name: "Emma", teamName: "Sky Hunters", record: "2-1", place: "5th", totalPoints: 567, avgPoints: 189 },
  { id: "manager-5", name: "Crazy", teamName: "Pixies", record: "0-3", place: "9th", totalPoints: 543, avgPoints: 181 },
  { id: "manager-6", name: "Alex", teamName: "Storm Chasers", record: "2-1", place: "6th", totalPoints: 603, avgPoints: 201 },
  { id: "manager-7", name: "Jordan", teamName: "Lightning Bolts", record: "1-2", place: "8th", totalPoints: 585, avgPoints: 195 },
  { id: "manager-8", name: "Taylor", teamName: "Phoenix Rising", record: "3-0", place: "2nd", totalPoints: 630, avgPoints: 210 },
  { id: "manager-9", name: "Casey", teamName: "Thunder Wolves", record: "0-3", place: "11th", totalPoints: 534, avgPoints: 178 },
  { id: "manager-10", name: "Morgan", teamName: "Ice Breakers", record: "1-2", place: "10th", totalPoints: 555, avgPoints: 185 },
  { id: "manager-11", name: "Riley", teamName: "Fire Hawks", record: "2-1", place: "12th", totalPoints: 549, avgPoints: 183 },
];

// Mock roster data generator
const generateMockRoster = (manager: typeof otherManagers[0]) => {
  return {
    managerName: manager.name,
    teamName: manager.teamName,
    record: { wins: parseInt(manager.record.split("-")[0]), losses: parseInt(manager.record.split("-")[1]), place: manager.place },
    totalPoints: manager.totalPoints,
    avgPoints: manager.avgPoints,
    currentWeek: 3,
    lastMatchup: {
      myTeam: manager.teamName,
      myScore: Math.floor(Math.random() * 50 + 150),
      opponent: otherManagers[Math.floor(Math.random() * otherManagers.length)].teamName,
      opponentScore: Math.floor(Math.random() * 50 + 150)
    },
    currentMatchup: {
      myTeam: manager.teamName,
      myScore: Math.floor(Math.random() * 50 + 150),
      opponent: otherManagers[Math.floor(Math.random() * otherManagers.length)].teamName,
      opponentScore: Math.floor(Math.random() * 50 + 150)
    },
    teams: [
      // 2v2 Slots
      { slot: "2s", name: "Flames CL", score: 48.5, opponent: "Puffins CL", oprk: 2, fprk: 1, fpts: 425.0, avg: 53.1, last: 52.0, goals: 145, shots: 892, saves: 234, assists: 98, demos: 67, teamRecord: "8-2" },
      { slot: "2s", name: "Torch ML", score: 46.0, opponent: "Eclipse ML", oprk: 5, fprk: 2, fpts: 398.5, avg: 49.8, last: 48.5, goals: 138, shots: 856, saves: 221, assists: 94, demos: 62, teamRecord: "7-3" },
      // 3v3 Slots
      { slot: "3s", name: "Puffins CL", score: 45.5, opponent: "Flames CL", oprk: 1, fprk: 3, fpts: 385.0, avg: 48.1, last: 46.0, goals: 132, shots: 824, saves: 215, assists: 89, demos: 58, teamRecord: "6-4" },
      { slot: "3s", name: "Eclipse ML", score: 44.0, opponent: "Torch ML", oprk: 3, fprk: 4, fpts: 372.5, avg: 46.6, last: 45.0, goals: 128, shots: 798, saves: 208, assists: 86, demos: 55, teamRecord: "6-4" },
      // Flex Slot
      { slot: "FLX", name: "Vortex CL", score: 43.5, opponent: "Lightning DL", oprk: 6, fprk: 5, fpts: 368.0, avg: 46.0, last: 44.5, goals: 125, shots: 782, saves: 202, assists: 83, demos: 53, teamRecord: "5-5" },
      // Bench
      { slot: "BE", name: "Lightning DL", score: 0, opponent: "Vortex CL", oprk: 4, fprk: 6, fpts: 356.0, avg: 44.5, last: 43.0, goals: 121, shots: 765, saves: 198, assists: 81, demos: 51, teamRecord: "5-5" },
      { slot: "BE", name: "Phoenix ML", score: 0, opponent: "Storm CL", oprk: 8, fprk: 7, fpts: 342.5, avg: 42.8, last: 41.5, goals: 116, shots: 743, saves: 189, assists: 77, demos: 48, teamRecord: "4-6" },
      { slot: "BE", name: "Storm CL", score: 0, opponent: "Phoenix ML", oprk: 7, fprk: 8, fpts: 335.0, avg: 41.9, last: 40.0, goals: 113, shots: 728, saves: 184, assists: 75, demos: 46, teamRecord: "4-6" },
    ]
  };
};

export default function OpponentsPage() {
  const [selectedManagerId, setSelectedManagerId] = useState(otherManagers[0].id);
  const [currentWeek, setCurrentWeek] = useState(3);
  const [activeTab, setActiveTab] = useState<"lineup" | "stats">("lineup");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const selectedManager = otherManagers.find(m => m.id === selectedManagerId) || otherManagers[0];
  const roster = generateMockRoster(selectedManager);

  const handleTeamClick = (teamName: string) => {
    // Parse team name like "Flames CL" to get "CL" and "Flames"
    const parts = teamName.split(" ");
    const leagueId = parts[parts.length - 1];
    const name = parts.slice(0, -1).join(" ");
    const teamId = `${leagueId}${name.replace(/\s+/g, "")}`;
    const team = TEAMS.find(t => t.id === teamId);
    if (team) {
      setSelectedTeam({
        ...team,
        fpts: Math.floor(Math.random() * 100) + 400,
        avg: Math.floor(Math.random() * 30) + 40,
        last: Math.floor(Math.random() * 30) + 40,
        rank: Math.floor(Math.random() * 10) + 1,
        record: `${Math.floor(Math.random() * 8) + 2}-${Math.floor(Math.random() * 3)}`,
        status: "free-agent"
      });
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Team Modal */}
      <TeamModal team={showModal ? selectedTeam : null} onClose={() => setShowModal(false)} />

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
            <span>{selectedManager.name}</span>
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
              {otherManagers.map((manager) => (
                <button
                  key={manager.id}
                  onClick={() => {
                    setSelectedManagerId(manager.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: manager.id === selectedManagerId ? "rgba(255,255,255,0.1)" : "transparent",
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
                    if (manager.id !== selectedManagerId) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {manager.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                    {manager.teamName}
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
            <a
              href={`/leagues/2025-alpha/opponents/${selectedManagerId}/trade`}
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
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.95rem" }}>
                      {team.name ? (
                        <span
                          onClick={() => handleTeamClick(team.name)}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                          style={{
                            cursor: "pointer",
                            transition: "color 0.2s"
                          }}
                        >
                          {team.name}
                        </span>
                      ) : "-"}
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
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.95rem" }}>
                        <span
                          onClick={() => handleTeamClick(team.name)}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                          style={{
                            cursor: "pointer",
                            transition: "color 0.2s"
                          }}
                        >
                          {team.name}
                        </span>
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
