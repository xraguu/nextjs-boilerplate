"use client";

import { useState } from "react";
import { LEAGUES } from "@/lib/leagues";
import { TEAMS } from "@/lib/teams";

// Mock fantasy leagues data
const mockFantasyLeagues = [
  { id: "2025-alpha", name: "2025 RL Fantasy Alpha", leagueType: "PL", activeTeams: 12, season: 2025, commissioner: "Nick", status: "Active" },
  { id: "2025-beta", name: "2025 RL Fantasy Beta", leagueType: "ML", activeTeams: 10, season: 2025, commissioner: "Rover", status: "Active" },
  { id: "2025-gamma", name: "2025 RL Fantasy Gamma", leagueType: "CL", activeTeams: 12, season: 2025, commissioner: "FlipReset", status: "Active" },
  { id: "2024-championship", name: "2024 Championship League", leagueType: "PL", activeTeams: 12, season: 2024, commissioner: "AirDribbler", status: "Archived" },
];

export default function ManageLeaguesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<typeof LEAGUES[0] | null>(null);

  // Calculate team counts per MLE league
  const leagueStats = LEAGUES.map((league) => ({
    ...league,
    teamCount: TEAMS.filter((team) => team.leagueId === league.id).length,
    fantasyLeaguesCount: mockFantasyLeagues.filter((fl) => fl.leagueType === league.id).length,
  }));

  const filteredLeagues = leagueStats.filter((league) =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Create League Modal */}
      {showCreateModal && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowCreateModal(false)}
          />
          <div
            className="modal"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              maxWidth: "500px",
              width: "90%",
            }}
          >
            <div className="card" style={{ padding: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                  color: "var(--accent)",
                }}
              >
                Create New Fantasy League
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("League created successfully!");
                  setShowCreateModal(false);
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    League Name
                  </label>
                  <input
                    type="text"
                    placeholder="2025 RL Fantasy Alpha"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: "var(--text-main)",
                      fontSize: "0.95rem",
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    MLE League Type
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: "var(--text-main)",
                      fontSize: "0.95rem",
                    }}
                    required
                  >
                    <option value="">Select league type...</option>
                    {LEAGUES.map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Max Teams
                  </label>
                  <input
                    type="number"
                    defaultValue={12}
                    min={2}
                    max={16}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: "var(--text-main)",
                      fontSize: "0.95rem",
                    }}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Create League
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Header Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <input
          type="text"
          placeholder="Search leagues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "0.75rem 1rem",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "6px",
            color: "var(--text-main)",
            fontSize: "0.95rem",
            width: "300px",
          }}
        />
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Fantasy League
        </button>
      </div>

      {/* MLE Leagues Table */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--text-main)",
          }}
        >
          MLE Leagues
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                League
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Full Name
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Teams
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Fantasy Leagues
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Color
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeagues.map((league) => (
              <tr
                key={league.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: league.colorHex,
                    }}
                  >
                    {league.id}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    {league.name}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {league.teamCount}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {league.fantasyLeaguesCount}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      width: "60px",
                      height: "30px",
                      borderRadius: "6px",
                      background: `linear-gradient(135deg, ${league.colorHex} 0%, ${league.colorHextwo} 100%)`,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fantasy Leagues Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--text-main)",
          }}
        >
          Fantasy Leagues
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                League Name
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Teams
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Commissioner
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "right",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {mockFantasyLeagues.map((league) => (
              <tr
                key={league.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    {league.name}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: LEAGUES.find((l) => l.id === league.leagueType)
                        ?.colorHex,
                    }}
                  >
                    {league.leagueType}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {league.activeTeams}/12
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                  }}
                >
                  {league.commissioner}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      background:
                        league.status === "Active"
                          ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                          : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                      color: "white",
                    }}
                  >
                    {league.status}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "right",
                  }}
                >
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                    onClick={() => alert(`Edit ${league.name}`)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
