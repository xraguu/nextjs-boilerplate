"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";

// Mock managers data
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

// My roster (xenn)
const myRoster = {
  managerName: "xenn",
  teamName: "Fantastic Ballers",
  record: "2-1",
  place: "3rd",
  totalPoints: 543,
  avgPoints: 181,
  teams: [
    { slot: "2s", name: "AL Blizzard", fpts: 679, record: "7-3", rk: 3, logo: TEAMS.find(t => t.name === "Blizzard")?.logoPath || "" },
    { slot: "2s", name: "AL Comets", fpts: 652, record: "6-4", rk: 5, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "3s", name: "AL Blizzard", fpts: 679, record: "7-3", rk: 3, logo: TEAMS.find(t => t.name === "Blizzard")?.logoPath || "" },
    { slot: "3s", name: "AL Comets", fpts: 652, record: "6-4", rk: 4, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "FLX", name: "AL Comets", fpts: 652, record: "6-4", rk: 5, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 6, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 7, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 8, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
  ]
};

// Generate opponent roster
const generateOpponentRoster = () => {
  return [
    { slot: "2s", name: "AL Blizzard", fpts: 679, record: "7-3", rk: 3, logo: TEAMS.find(t => t.name === "Blizzard")?.logoPath || "" },
    { slot: "2s", name: "AL Comets", fpts: 652, record: "6-4", rk: 5, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "3s", name: "AL Blizzard", fpts: 679, record: "7-3", rk: 3, logo: TEAMS.find(t => t.name === "Blizzard")?.logoPath || "" },
    { slot: "3s", name: "AL Comets", fpts: 652, record: "6-4", rk: 4, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "FLX", name: "AL Comets", fpts: 652, record: "6-4", rk: 5, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 6, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 7, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 8, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
  ];
};

export default function TradePage() {
  const params = useParams();
  const managerId = params.slug as string;

  const [selectedMyTeams, setSelectedMyTeams] = useState<number[]>([]);
  const [selectedOpponentTeams, setSelectedOpponentTeams] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);
  const [selectedDropTeam, setSelectedDropTeam] = useState<string | null>(null);

  const opponent = otherManagers.find(m => m.id === managerId) || otherManagers[0];
  const opponentRoster = generateOpponentRoster();

  const isNonEqualTrade = selectedMyTeams.length < selectedOpponentTeams.length;

  const toggleMyTeam = (index: number) => {
    setSelectedMyTeams(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleOpponentTeam = (index: number) => {
    setSelectedOpponentTeams(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <>
      {/* Confirmation Modal - "Are you sure?" */}
      {showConfirmModal && (
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
          onClick={() => setShowConfirmModal(false)}
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
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1.5rem", textAlign: "center" }}>
              Confirm Trade Proposal
            </h2>

            <p style={{ fontSize: "1rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "2rem" }}>
              Are you sure you want to propose this trade?
              <br />
              <strong>You&apos;re sending {selectedMyTeams.length} team(s) for {selectedOpponentTeams.length} team(s)</strong>
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#ffffff",
                  fontWeight: 600,
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                No, Go Back
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  if (isNonEqualTrade) {
                    setShowDropModal(true);
                  } else {
                    alert("Trade proposed!");
                  }
                }}
                style={{
                  background: "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)",
                  color: "#1a1a2e",
                  fontWeight: 700,
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(242, 182, 50, 0.4)",
                }}
              >
                Yes, Propose Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drop Team Modal - appears if non-equal trade */}
      {showDropModal && (
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

            {/* Confirm button */}
            <button
              onClick={() => {
                if (selectedDropTeam) {
                  alert(`Trade proposed! You will drop ${selectedDropTeam}`);
                  setShowDropModal(false);
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
              Confirm
            </button>

            {/* Header - Team Info */}
            <div style={{ padding: "3.5rem 2rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>
                {myRoster.teamName}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {myRoster.managerName}
              </div>
              <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {myRoster.record}  {myRoster.place}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--accent)", marginTop: "1rem", fontWeight: 600 }}>
                Select a team to drop (You&apos;re receiving more teams than you&apos;re sending)
              </div>
            </div>

            {/* Roster Table with Checkboxes */}
            <div style={{ padding: "1.5rem 2rem" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.2)" }}>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Slot</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fpts</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rk</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRoster.teams.map((team, index) => (
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
                              src={team.logo}
                              alt={team.name}
                              width={24}
                              height={24}
                              style={{ borderRadius: "4px" }}
                            />
                            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600, fontSize: "0.9rem" }}>
                          {team.fpts}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                          {team.record}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                          {team.rk}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          <button
                            onClick={() => setSelectedDropTeam(team.name)}
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

      <div style={{ marginBottom: "2rem" }}>
        <Link
          href="/leagues/2025-alpha/opponents"
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#ffffff",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.9rem",
            marginBottom: "1rem"
          }}
        >
          ← Back to Opponents
        </Link>
        <h1 className="page-heading" style={{ color: "#d4af37", fontSize: "2.5rem", margin: 0 }}>Trade</h1>
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
          gap: "2rem",
          alignItems: "start",
          marginBottom: "2rem",
          paddingBottom: "2rem",
          borderBottom: "1px solid rgba(255,255,255,0.2)"
        }}>
          {/* My Team */}
          <div>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "0.25rem"
            }}>
              {myRoster.teamName}
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.9rem",
              margin: "0 0 0.5rem 0"
            }}>
              {myRoster.managerName}
            </p>
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.85rem",
              margin: 0
            }}>
              {myRoster.record}  {myRoster.place}
            </p>
            <div style={{
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.7)"
            }}>
              <span style={{ fontWeight: 600 }}>{myRoster.totalPoints} Fantasy Points</span>
              <span style={{ marginLeft: "1rem" }}>{myRoster.avgPoints} Avg Fantasy Points</span>
            </div>
          </div>

          {/* Propose Trade Button */}
          <button
            style={{
              background: "#d4af37",
              border: "none",
              color: "#1a1a2e",
              padding: "0.75rem 2rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              marginTop: "1rem"
            }}
            onClick={() => setShowConfirmModal(true)}
          >
            Propose Trade
          </button>

          {/* Opponent Team */}
          <div style={{ textAlign: "right" }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "0.25rem"
            }}>
              {opponent.teamName}
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.9rem",
              margin: "0 0 0.5rem 0"
            }}>
              {opponent.name}
            </p>
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.85rem",
              margin: 0
            }}>
              {opponent.record}  {opponent.place}
            </p>
            <div style={{
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.7)"
            }}>
              <span style={{ fontWeight: 600 }}>{opponent.totalPoints} Fantasy Points</span>
              <span style={{ marginLeft: "1rem" }}>{opponent.avgPoints} Avg Fantasy Points</span>
            </div>
          </div>
        </div>

        {/* Trade Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "2rem",
          alignItems: "start"
        }}>
          {/* My Teams - Left Side */}
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto auto auto",
              gap: "1rem",
              marginBottom: "0.5rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600
            }}>
              <div></div>
              <div>Team</div>
              <div style={{ textAlign: "right" }}>Fpts</div>
              <div style={{ textAlign: "center" }}>Record</div>
              <div style={{ textAlign: "center" }}>Rk</div>
              <div></div>
            </div>

            {myRoster.teams.map((team, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto auto",
                  gap: "1rem",
                  padding: "0.75rem 0",
                  alignItems: "center",
                  borderBottom: team.slot === "FLX" ? "2px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <Image src={team.logo} alt={team.name} width={24} height={24} style={{ borderRadius: "4px" }} />
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ffffff" }}>{team.name}</div>
                <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", textAlign: "right" }}>{team.fpts}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{team.record}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{team.rk}</div>
                <input
                  type="checkbox"
                  checked={selectedMyTeams.includes(idx)}
                  onChange={() => toggleMyTeam(idx)}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    accentColor: "#d4af37"
                  }}
                />
              </div>
            ))}
          </div>

          {/* Position Labels - Middle */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600,
              marginBottom: "1rem",
              textAlign: "center"
            }}>
              Position
            </div>
            {myRoster.teams.map((team, idx) => (
              <div
                key={idx}
                style={{
                  padding: "0.75rem 0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: team.slot === "BE" ? "rgba(255,255,255,0.5)" : "#d4af37",
                  textAlign: "center",
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {team.slot}
              </div>
            ))}
          </div>

          {/* Opponent Teams - Right Side */}
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto auto auto auto 1fr auto",
              gap: "1rem",
              marginBottom: "0.5rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600
            }}>
              <div></div>
              <div style={{ textAlign: "center" }}>Rk</div>
              <div style={{ textAlign: "center" }}>Record</div>
              <div style={{ textAlign: "right" }}>Fpts</div>
              <div>Team</div>
              <div></div>
            </div>

            {opponentRoster.map((team, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto auto auto 1fr auto",
                  gap: "1rem",
                  padding: "0.75rem 0",
                  alignItems: "center",
                  borderBottom: team.slot === "FLX" ? "2px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedOpponentTeams.includes(idx)}
                  onChange={() => toggleOpponentTeam(idx)}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    accentColor: "#d4af37"
                  }}
                />
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{team.rk}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{team.record}</div>
                <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", textAlign: "right" }}>{team.fpts}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ffffff" }}>{team.name}</div>
                <Image src={team.logo} alt={team.name} width={24} height={24} style={{ borderRadius: "4px" }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
