"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";

// Mock draft data
const mockDraftPicks = [
  { round: 1, pick: 1, manager: "Fantastic Ballers", team: TEAMS[0], status: "picked" },
  { round: 1, pick: 2, manager: "Pixies", team: null, status: "current" },
  { round: 1, pick: 3, manager: "Thunder", team: null, status: "upcoming" },
  { round: 1, pick: 4, manager: "Blazers", team: null, status: "upcoming" },
  { round: 2, pick: 5, manager: "Storm", team: null, status: "upcoming" },
  { round: 2, pick: 6, manager: "Lightning", team: null, status: "upcoming" },
  { round: 2, pick: 7, manager: "Phoenix", team: null, status: "upcoming" },
  { round: 2, pick: 8, manager: "Eclipse", team: null, status: "upcoming" },
  { round: 3, pick: 9, manager: "Vortex", team: null, status: "upcoming" },
  { round: 3, pick: 10, manager: "Flames", team: null, status: "upcoming" },
];

// Mock manager rosters
const mockRosters = {
  "Fantastic Ballers": [
    { slot: "2s", team: TEAMS[0], pick: "1.4 (4)" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Pixies": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
};

const managers = ["Fantastic Ballers", "Pixies", "Thunder", "Blazers"];

export default function DraftPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.LeagueID as string;

  const [selectedManager, setSelectedManager] = useState("Fantastic Ballers");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentRoster = mockRosters[selectedManager as keyof typeof mockRosters] || mockRosters["Fantastic Ballers"];

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem" }}>
      {/* Header with Timer and Roster Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
          Draft Room
        </h1>

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          {/* Timer */}
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
      </div>

      {/* Main Content Area */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "1.5rem" }}>
        {/* Left Side - Draft Picks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Recent Picks - Horizontal Scroll */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-main)" }}>
              Recent Picks
            </h3>
            <div style={{
              display: "flex",
              gap: "1rem",
              overflowX: "auto",
              paddingBottom: "1rem"
            }}>
              {mockDraftPicks.slice(0, 4).map((pick, idx) => (
                <div
                  key={idx}
                  style={{
                    minWidth: "200px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                    padding: "1rem",
                    border: `2px solid ${
                      pick.status === "current" ? "#4ade80" :
                      pick.status === "picked" ? "var(--accent)" :
                      "rgba(255,255,255,0.1)"
                    }`,
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Background Logo */}
                  {pick.team && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "120px",
                        height: "120px",
                        backgroundImage: `url(${pick.team.logoPath})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        opacity: 0.15,
                        pointerEvents: "none"
                      }}
                    />
                  )}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                      Pick {pick.round}.{pick.pick}
                    </div>
                    {pick.team ? (
                      <>
                        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                          {pick.team.leagueId} {pick.team.name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {pick.manager}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--accent)" }}>
                        {pick.status === "current" ? "On the Clock" : "Upcoming"}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Draft Grid */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "1px solid rgba(255,255,255,0.1)",
            overflowX: "auto"
          }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              {managers.map((manager) => (
                <div key={manager} style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    textAlign: "center",
                    color: "var(--text-main)"
                  }}>
                    {manager}
                  </div>
                </div>
              ))}
            </div>

            {/* Pick Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((rowIdx) => (
                <div key={rowIdx} style={{ display: "flex", gap: "1rem" }}>
                  {managers.map((manager, colIdx) => {
                    const pickIndex = rowIdx * managers.length + colIdx;
                    const pick = mockDraftPicks[pickIndex];

                    return (
                      <div
                        key={colIdx}
                        style={{
                          flex: 1,
                          minWidth: "200px",
                          padding: "1rem",
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: "6px",
                          border: `2px solid ${
                            pick?.status === "current" ? "#4ade80" :
                            pick?.status === "picked" ? "var(--accent)" :
                            "rgba(255,255,255,0.1)"
                          }`,
                          minHeight: "60px"
                        }}
                      >
                        {pick?.team && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Image
                              src={pick.team.logoPath}
                              alt={pick.team.name}
                              width={24}
                              height={24}
                              style={{ borderRadius: "4px" }}
                            />
                            <div>
                              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                                {pick.team.leagueId} {pick.team.name}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {pick.round}.{pick.pick}
                              </div>
                            </div>
                          </div>
                        )}
                        {!pick?.team && pick?.status === "current" && (
                          <button
                            onClick={() => router.push(`/leagues/${leagueId}/draft/make-pick`)}
                            style={{
                              background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                              color: "#ffffff",
                              padding: "0.5rem 1rem",
                              borderRadius: "6px",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              textAlign: "center",
                              border: "none",
                              cursor: "pointer",
                              width: "100%",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 4px 10px rgba(74, 222, 128, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            Pick {pick.round}.{pick.pick}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Roster Panel */}
        <div style={{
          background: "rgba(0,0,0,0.4)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: "1rem",
          maxHeight: "calc(100vh - 2rem)"
        }}>
          {/* Manager Dropdown */}
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#ffffff",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span>{selectedManager}</span>
              <span>{dropdownOpen ? "▲" : "▼"}</span>
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "0.5rem",
                  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  borderRadius: "8px",
                  padding: "0.5rem 0",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  zIndex: 1000
                }}
              >
                {managers.map((manager) => (
                  <button
                    key={manager}
                    onClick={() => {
                      setSelectedManager(manager);
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: manager === selectedManager ? "rgba(255,255,255,0.1)" : "transparent",
                      border: "none",
                      color: "#ffffff",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      if (manager !== selectedManager) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {manager}
                  </button>
                ))}
              </div>
            )}
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
                {currentRoster.map((slot, idx) => (
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
