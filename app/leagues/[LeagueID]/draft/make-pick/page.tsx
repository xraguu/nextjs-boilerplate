"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";

// Mock available teams (teams not yet drafted)
const availableTeams = TEAMS.slice(1, 15).map((team, index) => ({
  ...team,
  rank: index + 1,
  fptsLS: Math.floor(Math.random() * 50) + 200,
  avgLS: Math.floor(Math.random() * 20) + 40,
  goals: Math.floor(Math.random() * 30) + 50,
  shots: Math.floor(Math.random() * 100) + 500,
  saves: Math.floor(Math.random() * 50) + 100,
  assists: Math.floor(Math.random() * 20) + 40,
  demos: Math.floor(Math.random() * 15) + 20,
  record: `${Math.floor(Math.random() * 6) + 3}-${Math.floor(Math.random() * 6) + 3}`
}));

// Mock manager roster (same as draft page)
const mockRoster = [
  { slot: "2s", team: TEAMS[0], pick: "1.4 (4)" },
  { slot: "2s", team: null, pick: "" },
  { slot: "3s", team: null, pick: "" },
  { slot: "3s", team: null, pick: "" },
  { slot: "FLX", team: null, pick: "" },
  { slot: "BE", team: null, pick: "" },
  { slot: "BE", team: null, pick: "" },
  { slot: "BE", team: null, pick: "" },
];

export default function MakePickPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.LeagueID as string;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<typeof availableTeams[0] | null>(null);

  const handlePickTeam = (team: typeof availableTeams[0]) => {
    setSelectedTeam(team);
    setShowConfirmation(true);
  };

  const confirmPick = () => {
    // In real implementation, this would update the draft state
    setShowConfirmation(false);
    router.push(`/leagues/${leagueId}/draft`);
  };

  const cancelPick = () => {
    setShowConfirmation(false);
    setSelectedTeam(null);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem" }}>
      {/* Confirmation Modal */}
      {showConfirmation && selectedTeam && (
        <div
          onClick={cancelPick}
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
            zIndex: 2000,
            padding: "1rem"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "500px",
              width: "100%",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              borderRadius: "12px",
              padding: "2rem",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
          >
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "1.5rem",
              textAlign: "center"
            }}>
              Confirm Draft Pick
            </h2>

            <div style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <Image
                  src={selectedTeam.logoPath}
                  alt={selectedTeam.name}
                  width={60}
                  height={60}
                  style={{ borderRadius: "8px" }}
                />
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {selectedTeam.leagueId} {selectedTeam.name}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Record: {selectedTeam.record}
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: "1rem",
                color: "var(--text-main)",
                textAlign: "center",
                lineHeight: "1.6"
              }}>
                Are you sure you want to choose <span style={{ color: "var(--accent)", fontWeight: 600 }}>{selectedTeam.leagueId} {selectedTeam.name}</span> for <span style={{ color: "var(--accent)", fontWeight: 600 }}>Pick 1.2</span>?
              </p>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={cancelPick}
                style={{
                  flex: 1,
                  padding: "0.75rem 1.5rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
              >
                No, Go Back
              </button>
              <button
                onClick={confirmPick}
                style={{
                  flex: 1,
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(74, 222, 128, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 15px rgba(74, 222, 128, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 10px rgba(74, 222, 128, 0.3)";
                }}
              >
                Yes, Draft Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Timer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
          Make A Pick
        </h1>

        <div style={{
          background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
          padding: "0.75rem 2rem",
          borderRadius: "25px",
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#ffffff",
          boxShadow: "0 4px 10px rgba(74, 222, 128, 0.3)"
        }}>
          00:17
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "1.5rem" }}>
        {/* Left Side - Available Teams Table */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.1)",
          overflowX: "auto"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Rank</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Team</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Fpts LS</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Avg LS</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Goals</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Shots</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Saves</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Assists</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Demos</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Record</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {availableTeams.map((team) => (
                <tr key={team.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)" }}>
                    {team.rank}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Image
                        src={team.logoPath}
                        alt={team.name}
                        width={32}
                        height={32}
                        style={{ borderRadius: "4px" }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-main)" }}>
                          {team.leagueId} {team.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.9rem" }}>
                    {team.fptsLS}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {team.avgLS}
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
                    <button
                      onClick={() => handlePickTeam(team)}
                      style={{
                        background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                        color: "#ffffff",
                        padding: "0.5rem 1.5rem",
                        borderRadius: "6px",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(74, 222, 128, 0.3)",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(74, 222, 128, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(74, 222, 128, 0.3)";
                      }}
                    >
                      Pick
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side - Roster Panel (same as draft page) */}
        <div style={{
          background: "rgba(0,0,0,0.4)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: "1rem",
          maxHeight: "calc(100vh - 2rem)"
        }}>
          <div style={{
            padding: "0.75rem 1rem",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            textAlign: "center",
            color: "var(--text-main)"
          }}>
            Fantastic Ballers ▼
          </div>

          {/* Roster Table */}
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Slot</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Team</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Pick</th>
                </tr>
              </thead>
              <tbody>
                {mockRoster.map((slot, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      {slot.slot}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      {slot.team ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Image
                            src={slot.team.logoPath}
                            alt={slot.team.name}
                            width={20}
                            height={20}
                            style={{ borderRadius: "4px" }}
                          />
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                            {slot.team.leagueId} {slot.team.name}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {slot.pick || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
