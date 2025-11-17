"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";
import TeamModal from "@/components/TeamModal";

// helper type so we can optionally reference `rank`
type TeamWithRank = (typeof TEAMS)[number] & { rank?: number };

// Mock draft data
const mockDraftPicks = [
  {
    round: 1,
    pick: 1,
    manager: "Fantastic Ballers",
    team: TEAMS[0],
    status: "picked",
  },
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
const managers = [
  "Fantastic Ballers",
  "Pixies",
  "Thunder Strikers",
  "Ice Warriors",
  "Fire Dragons",
  "Sky Hunters",
  "Storm Chasers",
  "Lightning Bolts",
  "Phoenix Rising",
  "Thunder Wolves",
  "Ice Breakers",
  "Fire Hawks",
];

const mockRosters = {
  "Fantastic Ballers": [
    { slot: "2s", team: TEAMS[0], pick: "1.1 (1)" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  Pixies: [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Thunder Strikers": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Ice Warriors": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Fire Dragons": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Sky Hunters": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Storm Chasers": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Lightning Bolts": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Phoenix Rising": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Thunder Wolves": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Ice Breakers": [
    { slot: "2s", team: null, pick: "" },
    { slot: "2s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "3s", team: null, pick: "" },
    { slot: "FLX", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
    { slot: "BE", team: null, pick: "" },
  ],
  "Fire Hawks": [
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

export default function DraftPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.LeagueID as string;

  const [selectedManager, setSelectedManager] = useState("Fantastic Ballers");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<
    (typeof TEAMS)[number] | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<
    "rosters" | "teams" | "queue"
  >("rosters");

  // lazy initialize draftQueue and autodraftEnabled from localStorage to avoid setState in mount effect
  const [draftQueue, setDraftQueue] = useState<typeof TEAMS>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("draftQueue");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse draft queue from localStorage", e);
      return [];
    }
  });

  const [autodraftEnabled, setAutodraftEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("autodraftEnabled") === "true";
  });

  // Sync queue changes to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("draftQueue", JSON.stringify(draftQueue));
  }, [draftQueue]);

  const toggleAutodraft = () => {
    const newValue = !autodraftEnabled;
    setAutodraftEnabled(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("autodraftEnabled", String(newValue));
    }
  };

  const currentRoster =
    mockRosters[selectedManager as keyof typeof mockRosters] ||
    mockRosters["Fantastic Ballers"];

  return (
    <div>
      {/* Team Stats Modal */}
      <TeamModal
        team={
          showModal && selectedTeam
            ? {
                ...(selectedTeam as TeamWithRank),
                rosteredBy:
                  ((selectedTeam as TeamWithRank).rank ?? 0) % 2 === 0
                    ? { rosterName: "Fantastic Ballers", managerName: "xenn" }
                    : undefined,
              }
            : null
        }
        onClose={() => setShowModal(false)}
        isDraftContext={true}
      />

      <div style={{ minHeight: "100vh", padding: "2rem 1rem" }}>
        {/* Header with Timer and Roster Selector */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "var(--accent)",
              margin: 0,
            }}
          >
            Draft Room
          </h1>

          <div
            style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}
          >
            {/* Timer */}
            <div
              style={{
                background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                padding: "0.75rem 2rem",
                borderRadius: "25px",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#ffffff",
                boxShadow: "0 4px 10px rgba(74, 222, 128, 0.3)",
              }}
            >
              00:17
            </div>

            {/* Autodraft Button */}
            <button
              onClick={toggleAutodraft}
              style={{
                background: autodraftEnabled
                  ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)"
                  : "rgba(255,255,255,0.1)",
                border: `2px solid ${
                  autodraftEnabled ? "#f2b632" : "var(--accent)"
                }`,
                padding: "0.75rem 1.5rem",
                borderRadius: "25px",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: autodraftEnabled ? "#ffffff" : "var(--accent)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: autodraftEnabled
                  ? "0 4px 12px rgba(242, 182, 50, 0.4)"
                  : "0 2px 8px rgba(242, 182, 50, 0.2)",
              }}
              onMouseEnter={(e) => {
                if (!autodraftEnabled) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!autodraftEnabled) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }
              }}
            >
              Autodraft {autodraftEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "1.5rem",
          }}
        >
          {/* Left Side - Draft Picks */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Recent Picks - Horizontal Scroll */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(50, 50, 60, 0.6) 0%, rgba(40, 40, 50, 0.6) 100%)",
                borderRadius: "12px",
                padding: "1.5rem",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "var(--text-main)",
                }}
              >
                Recent Picks
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  overflowX: "auto",
                  paddingBottom: "1rem",
                }}
              >
                {mockDraftPicks.slice(0, 4).map((pick, idx) => (
                  <div
                    key={idx}
                    style={{
                      minWidth: "200px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                      padding: "1rem",
                      border: `2px solid ${
                        pick.status === "current"
                          ? "#4ade80"
                          : pick.status === "picked"
                          ? "var(--accent)"
                          : "rgba(255,255,255,0.1)"
                      }`,
                      position: "relative",
                      overflow: "hidden",
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
                          pointerEvents: "none",
                        }}
                      />
                    )}
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Pick {pick.round}.{pick.pick}
                      </div>
                      {pick.team ? (
                        <>
                          <div
                            onClick={() => {
                              setSelectedTeam(pick.team);
                              setShowModal(true);
                            }}
                            style={{
                              fontSize: "1rem",
                              fontWeight: 600,
                              color: "var(--text-main)",
                              marginBottom: "0.25rem",
                              cursor: "pointer",
                              transition: "color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "var(--accent)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "var(--text-main)")
                            }
                          >
                            {pick.team.leagueId} {pick.team.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {pick.manager}
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "var(--accent)",
                          }}
                        >
                          {pick.status === "current"
                            ? "On the Clock"
                            : "Upcoming"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Draft Grid */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(50, 50, 60, 0.6) 0%, rgba(40, 40, 50, 0.6) 100%)",
                borderRadius: "12px",
                padding: "1.5rem",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {/* Round Headers */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {/* Empty corner cell for team names column */}
                  <div style={{ width: "180px", flexShrink: 0 }}></div>
                  {/* Round numbers 1-8 */}
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((round) => (
                    <div
                      key={round}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        textAlign: "center",
                        color: "var(--accent)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div>Round</div>
                      <div>{round}</div>
                    </div>
                  ))}
                </div>

                {/* Team Rows */}
                {managers.map((manager, teamIdx) => (
                  <div key={manager} style={{ display: "flex", gap: "0.5rem" }}>
                    {/* Team Name Cell */}
                    <div
                      style={{
                        width: "180px",
                        flexShrink: 0,
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color:
                          manager === selectedManager
                            ? "var(--accent)"
                            : "var(--text-main)",
                      }}
                    >
                      <span>{manager}</span>
                      {manager === selectedManager && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            opacity: 0.8,
                          }}
                        >
                          (You)
                        </span>
                      )}
                    </div>

                    {/* Pick Cells for each round */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((roundIdx) => {
                      const pickIndex = roundIdx * managers.length + teamIdx;
                      const pick = mockDraftPicks[pickIndex];

                      return (
                        <div
                          key={roundIdx}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: "1rem",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "6px",
                            border: `2px solid ${
                              pick?.status === "current"
                                ? "#4ade80"
                                : pick?.status === "picked"
                                ? "var(--accent)"
                                : "rgba(255,255,255,0.1)"
                            }`,
                            minHeight: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Picked team */}
                          {pick?.team && (
                            <>
                              {/* Background Logo */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  width: "80px",
                                  height: "80px",
                                  backgroundImage: `url(${pick.team.logoPath})`,
                                  backgroundSize: "contain",
                                  backgroundRepeat: "no-repeat",
                                  backgroundPosition: "center",
                                  opacity: 0.15,
                                  pointerEvents: "none",
                                }}
                              />
                              {/* Team Name */}
                              <div
                                onClick={() => {
                                  setSelectedTeam(pick.team);
                                  setShowModal(true);
                                }}
                                style={{
                                  position: "relative",
                                  zIndex: 1,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: "var(--text-main)",
                                  cursor: "pointer",
                                  transition: "color 0.2s",
                                  textAlign: "center",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--accent)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--text-main)")
                                }
                              >
                                {pick.team.leagueId} {pick.team.name}
                              </div>
                            </>
                          )}
                          {/* Current pick button */}
                          {!pick?.team && pick?.status === "current" && (
                            <button
                              onClick={() =>
                                router.push(
                                  `/leagues/${leagueId}/draft/make-pick`
                                )
                              }
                              style={{
                                background:
                                  "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                                color: "#ffffff",
                                padding: "0.5rem 1rem",
                                borderRadius: "6px",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                textAlign: "center",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 10px rgba(74, 222, 128, 0.4)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
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
          <div
            style={{
              background:
                "radial-gradient(circle at top left, #1d3258, #020617)",
              borderRadius: "12px",
              padding: "1.5rem",
              border: "1px solid rgba(255,255,255,0.1)",
              position: "sticky",
              top: "1rem",
              maxHeight: "calc(100vh - 2rem)",
            }}
          >
            {/* Tabs */}
            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}
            >
              <button
                onClick={() => setRightPanelTab("rosters")}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  background:
                    rightPanelTab === "rosters"
                      ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)"
                      : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Rosters
              </button>
              <button
                onClick={() => setRightPanelTab("teams")}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  background:
                    rightPanelTab === "teams"
                      ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)"
                      : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Available Teams
              </button>
              <button
                onClick={() => setRightPanelTab("queue")}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  background:
                    rightPanelTab === "queue"
                      ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)"
                      : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Queue ({draftQueue.length})
              </button>
            </div>

            {/* Manager Dropdown (only show for Rosters tab) */}
            {rightPanelTab === "rosters" && (
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
                    justifyContent: "space-between",
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
                      background:
                        "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                      borderRadius: "8px",
                      padding: "0.5rem 0",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                      zIndex: 1000,
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
                          background:
                            manager === selectedManager
                              ? "rgba(255,255,255,0.1)"
                              : "transparent",
                          border: "none",
                          color: "#ffffff",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "background 0.2s ease",
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.1)";
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
            )}

            {/* Content based on active tab */}
            {rightPanelTab === "rosters" && (
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <th
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "left",
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.9)",
                          fontWeight: 600,
                        }}
                      >
                        Slot
                      </th>
                      <th
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "left",
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.9)",
                          fontWeight: 600,
                        }}
                      >
                        Team
                      </th>
                      <th
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "right",
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.9)",
                          fontWeight: 600,
                        }}
                      >
                        Pick
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRoster.map((slot, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <td
                          style={{
                            padding: "0.75rem 0.5rem",
                            fontSize: "0.9rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {slot.slot}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>
                          {slot.team ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <Image
                                src={slot.team.logoPath}
                                alt={slot.team.name}
                                width={20}
                                height={20}
                                style={{ borderRadius: "4px" }}
                              />
                              <span
                                onClick={() => {
                                  setSelectedTeam(slot.team);
                                  setShowModal(true);
                                }}
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                  color: "var(--text-main)",
                                  cursor: "pointer",
                                  transition: "color 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--accent)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--text-main)")
                                }
                              >
                                {slot.team.leagueId} {slot.team.name}
                              </span>
                            </div>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.85rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              -
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 0.5rem",
                            textAlign: "right",
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {slot.pick || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* MLE Teams Tab */}
            {rightPanelTab === "teams" && (
              <div>
                {/* See Full Stats Button */}
                <button
                  onClick={() =>
                    router.push(`/leagues/${leagueId}/draft/make-pick`)
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background:
                      "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    marginBottom: "1rem",
                    boxShadow: "0 4px 10px rgba(242, 182, 50, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 15px rgba(242, 182, 50, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 10px rgba(242, 182, 50, 0.3)";
                  }}
                >
                  See Full Stats
                </button>

                <div
                  style={{
                    maxHeight: "calc(100vh - 15rem)",
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {TEAMS.map((team) => (
                      <div
                        key={team.id}
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowModal(true);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          border: "1px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.1)";
                          e.currentTarget.style.borderColor = "var(--accent)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.05)";
                          e.currentTarget.style.borderColor = "transparent";
                        }}
                      >
                        <Image
                          src={team.logoPath}
                          alt={team.name}
                          width={24}
                          height={24}
                          style={{ borderRadius: "4px" }}
                        />
                        <span
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "var(--text-main)",
                          }}
                        >
                          {team.leagueId} {team.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Draft Queue Tab */}
            {rightPanelTab === "queue" && (
              <div>
                {draftQueue.length === 0 ? (
                  <div
                    style={{
                      padding: "2rem 1rem",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
                      No teams in queue
                    </p>
                    <p style={{ fontSize: "0.85rem" }}>
                      Add teams to your draft queue from the Available Teams
                      page
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {draftQueue.map((team, idx) => (
                      <div
                        key={team.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "6px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#000",
                          }}
                        >
                          {idx + 1}
                        </div>
                        <Image
                          src={team.logoPath}
                          alt={team.name}
                          width={24}
                          height={24}
                          style={{ borderRadius: "4px" }}
                        />
                        <span
                          style={{
                            flex: 1,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "var(--text-main)",
                          }}
                        >
                          {team.leagueId} {team.name}
                        </span>

                        {/* Reorder buttons */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                          }}
                        >
                          <button
                            onClick={() => {
                              if (idx > 0) {
                                const newQueue = [...draftQueue];
                                [newQueue[idx - 1], newQueue[idx]] = [
                                  newQueue[idx],
                                  newQueue[idx - 1],
                                ];
                                setDraftQueue(newQueue);
                              }
                            }}
                            disabled={idx === 0}
                            style={{
                              background: "transparent",
                              border: "none",
                              color:
                                idx === 0
                                  ? "rgba(255,255,255,0.2)"
                                  : "var(--text-muted)",
                              cursor: idx === 0 ? "not-allowed" : "pointer",
                              fontSize: "0.8rem",
                              padding: "0",
                              lineHeight: 1,
                            }}
                            onMouseEnter={(e) => {
                              if (idx !== 0)
                                e.currentTarget.style.color = "var(--accent)";
                            }}
                            onMouseLeave={(e) => {
                              if (idx !== 0)
                                e.currentTarget.style.color =
                                  "var(--text-muted)";
                            }}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => {
                              if (idx < draftQueue.length - 1) {
                                const newQueue = [...draftQueue];
                                [newQueue[idx], newQueue[idx + 1]] = [
                                  newQueue[idx + 1],
                                  newQueue[idx],
                                ];
                                setDraftQueue(newQueue);
                              }
                            }}
                            disabled={idx === draftQueue.length - 1}
                            style={{
                              background: "transparent",
                              border: "none",
                              color:
                                idx === draftQueue.length - 1
                                  ? "rgba(255,255,255,0.2)"
                                  : "var(--text-muted)",
                              cursor:
                                idx === draftQueue.length - 1
                                  ? "not-allowed"
                                  : "pointer",
                              fontSize: "0.8rem",
                              padding: "0",
                              lineHeight: 1,
                            }}
                            onMouseEnter={(e) => {
                              if (idx !== draftQueue.length - 1)
                                e.currentTarget.style.color = "var(--accent)";
                            }}
                            onMouseLeave={(e) => {
                              if (idx !== draftQueue.length - 1)
                                e.currentTarget.style.color =
                                  "var(--text-muted)";
                            }}
                          >
                            ▼
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setDraftQueue((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                            padding: "0.25rem",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#ef4444")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--text-muted)")
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
