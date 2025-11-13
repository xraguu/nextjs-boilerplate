"use client";

import { useState } from "react";

// Mock data
const mockFreeAgents = [
  { id: 1, name: "NRG Esports", tier: "Premier", region: "NA", weekPoints: 38.0, available: true, waiverPriority: null },
  { id: 2, name: "Team Liquid", tier: "Premier", region: "EU", weekPoints: 35.5, available: true, waiverPriority: null },
  { id: 3, name: "Moist Esports", tier: "Premier", region: "EU", weekPoints: 42.0, available: true, waiverPriority: null },
  { id: 4, name: "FURIA Esports", tier: "Challenger", region: "SAM", weekPoints: 28.5, available: true, waiverPriority: null },
  { id: 5, name: "PWR", tier: "Challenger", region: "OCE", weekPoints: 31.0, available: true, waiverPriority: null },
];

const mockWaivers = [
  { id: 1, teamName: "OpTic Gaming", submittedBy: "You", priority: 1, status: "Pending", droppingTeam: "FaZe Clan" },
  { id: 2, teamName: "Team Liquid", submittedBy: "Rover", priority: 3, status: "Pending", droppingTeam: "Complexity Gaming" },
  { id: 3, teamName: "Moist Esports", submittedBy: "FlipReset", priority: 2, status: "Processing", droppingTeam: "PWR" },
];

const mockTrades = [
  {
    id: 1,
    from: "You",
    to: "Rover",
    offering: ["G2 Esports", "FaZe Clan"],
    receiving: ["Spacestation Gaming"],
    status: "Pending",
    date: "2025-11-10"
  },
  {
    id: 2,
    from: "FlipReset",
    to: "You",
    offering: ["Version1"],
    receiving: ["Complexity Gaming"],
    status: "Pending",
    date: "2025-11-09"
  }
];

const mockLeagueSettings = {
  name: "2025 RL Fantasy Alpha",
  season: 2025,
  maxTeams: 10,
  rosterSize: 5,
  startingSpots: 3,
  waiverType: "Priority-based",
  tradeDeadline: "Week 10",
  playoffWeeks: "11-12"
};

export default function TeamPortalPage() {
  const [activeTab, setActiveTab] = useState<"free-agents" | "waivers" | "trades" | "settings">("free-agents");

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-heading">Team Portal</h1>
        <p className="page-subtitle">
          Manage free agents, waivers, trades, and league settings
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "free-agents" ? "active" : ""}`}
          onClick={() => setActiveTab("free-agents")}
        >
          Free Agents
        </button>
        <button
          className={`tab ${activeTab === "waivers" ? "active" : ""}`}
          onClick={() => setActiveTab("waivers")}
        >
          Waivers
        </button>
        <button
          className={`tab ${activeTab === "trades" ? "active" : ""}`}
          onClick={() => setActiveTab("trades")}
        >
          Trade Proposals
        </button>
        <button
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          League Settings
        </button>
      </div>

      {/* Free Agents Tab */}
      {activeTab === "free-agents" && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Available Free Agents</h2>
            <span className="card-subtitle">{mockFreeAgents.length} teams available</span>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {mockFreeAgents.map((team) => (
              <div key={team.id} className="card card-outline">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      {team.name}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {team.tier} • {team.region}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)" }}>
                        {team.weekPoints}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        pts/week
                      </div>
                    </div>
                    <button className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                      Add Team
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Waivers Tab */}
      {activeTab === "waivers" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Waiver Claims</h2>
              <p className="card-subtitle">Claims process at the end of each week</p>
            </div>
            <button className="btn btn-primary">Submit Claim</button>
          </div>

          {mockWaivers.length === 0 ? (
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
              No active waiver claims
            </p>
          ) : (
            <div style={{ marginTop: "1rem", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Priority</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Manager</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Dropping</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWaivers.map((waiver) => (
                    <tr
                      key={waiver.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        backgroundColor: waiver.submittedBy === "You" ? "rgba(242, 182, 50, 0.08)" : "transparent"
                      }}
                    >
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                        #{waiver.priority}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                        {waiver.teamName}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        {waiver.submittedBy}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)" }}>
                        {waiver.droppingTeam}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                        <span className={waiver.status === "Pending" ? "pill pill-muted" : "pill"}>
                          {waiver.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Trades Tab */}
      {activeTab === "trades" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Trade Proposals</h2>
              <p className="card-subtitle">Manage your trade offers</p>
            </div>
            <button className="btn btn-primary">Propose Trade</button>
          </div>

          {mockTrades.length === 0 ? (
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
              No active trade proposals
            </p>
          ) : (
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {mockTrades.map((trade) => (
                <div key={trade.id} className="card card-solid">
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      {trade.from} → {trade.to} • {new Date(trade.date).toLocaleDateString()}
                    </div>
                    <span className={trade.status === "Pending" ? "pill" : "pill pill-muted"}>
                      {trade.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1rem", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                        Offering:
                      </div>
                      {trade.offering.map((team, idx) => (
                        <div key={idx} style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                          {team}
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: "1.5rem", color: "var(--text-muted)" }}>⇄</div>

                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                        Receiving:
                      </div>
                      {trade.receiving.map((team, idx) => (
                        <div key={idx} style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                          {team}
                        </div>
                      ))}
                    </div>
                  </div>

                  {trade.to === "You" && trade.status === "Pending" && (
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-primary" style={{ flex: 1 }}>
                        Accept
                      </button>
                      <button className="btn btn-ghost" style={{ flex: 1 }}>
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">League Settings</h2>
            <span className="card-subtitle">View league rules and configuration</span>
          </div>

          <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
            <div className="card card-outline">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--accent)" }}>
                League Information
              </h3>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>League Name:</span>
                  <span style={{ fontWeight: 600 }}>{mockLeagueSettings.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Season:</span>
                  <span style={{ fontWeight: 600 }}>{mockLeagueSettings.season}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Max Teams:</span>
                  <span style={{ fontWeight: 600 }}>{mockLeagueSettings.maxTeams}</span>
                </div>
              </div>
            </div>

            <div className="card card-outline">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--accent)" }}>
                Roster Settings
              </h3>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Roster Size:</span>
                  <span style={{ fontWeight: 600 }}>{mockLeagueSettings.rosterSize}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Starting Spots:</span>
                  <span style={{ fontWeight: 600 }}>{mockLeagueSettings.startingSpots}</span>
                </div>
              </div>
            </div>

            <div className="card card-outline">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--accent)" }}>
                League Rules
              </h3>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Waiver Type:</span>
                  <span style={{ fontWeight: 600 }}>{mockLeagueSettings.waiverType}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Trade Deadline:</span>
                  <span style={{ fontWeight: 600 }}>{mockLeagueSettings.tradeDeadline}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Playoff Weeks:</span>
                  <span style={{ fontWeight: 600 }}>{mockLeagueSettings.playoffWeeks}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
