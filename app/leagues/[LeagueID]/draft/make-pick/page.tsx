"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import DraftTeamModal from "@/components/DraftTeamModal";

// Available teams will be fetched from API
interface MLETeam {
  id: string;
  name: string;
  leagueId: string;
  slug: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
  rank?: number;
  fptsLS?: number;
  avgLS?: number;
  goals?: number;
  shots?: number;
  saves?: number;
  assists?: number;
  demos?: number;
  record?: string;
}

// Mock manager list
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
  "Fire Hawks"
];

// Mock manager rosters
const mockRosters: Record<string, Array<{ slot: string; team: MLETeam | null; pick: string }>> = {
  "Fantastic Ballers": [
    { slot: "2s", team: null, pick: "1.1 (1)" },
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

export default function MakePickPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.LeagueID as string;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<MLETeam | null>(null);
  const [selectedManager, setSelectedManager] = useState("Fantastic Ballers");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTeam, setModalTeam] = useState<MLETeam | null>(null);
  const [availableTeams, setAvailableTeams] = useState<MLETeam[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentManagerId, setCurrentManagerId] = useState<string | null>(null);

  // Mock: Currently it's NOT the user's pick (Pixies is on the clock, user is Fantastic Ballers)
  const isMyPick = false; // In real implementation, this would check if current pick manager === user's manager
  const [rightPanelTab, setRightPanelTab] = useState<"roster" | "queue">("roster");

  // Draft state and timer
  const [draftStatus, setDraftStatus] = useState<string>("not_started");
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Fetch current user session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const session = await response.json();
          setCurrentUserId(session?.user?.id || null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchSession();
  }, []);

  // Fetch draft state to get status, timer, and available teams
  useEffect(() => {
    const fetchDraftState = async () => {
      try {
        const response = await fetch(`/api/leagues/${leagueId}/draft`);
        if (response.ok) {
          const data = await response.json();
          setDraftStatus(data.status);

          // Set current manager ID when user team is found
          if (currentUserId && data.fantasyTeams) {
            const userTeam = data.fantasyTeams.find((t: any) => t.ownerUserId === currentUserId);
            if (userTeam && !currentManagerId) {
              setCurrentManagerId(userTeam.id);
            }
          }

          // Update available teams from draft state
          if (data.availableTeams) {
            // Add mock stats for display (in production, these would come from API)
            const teamsWithStats = data.availableTeams.map((team: MLETeam, index: number) => ({
              ...team,
              rank: index + 1,
              fptsLS: 240 - (index * 3),
              avgLS: 55 - index,
              goals: 75 - (index * 2),
              shots: 650 - (index * 10),
              saves: 140 - (index * 3),
              assists: 55 - index,
              demos: 32 - index,
              record: `${8 - Math.floor(index / 2)}-${3 + Math.floor(index / 2)}`
            }));
            setAvailableTeams(teamsWithStats);
          }

          // Update timer if draft is in progress
          if (data.status === "in_progress" && data.currentPickDeadline) {
            const deadline = new Date(data.currentPickDeadline).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
            setTimeRemaining(remaining);
          }
        }
      } catch (error) {
        console.error("Failed to fetch draft state:", error);
      }
    };

    fetchDraftState();
    const interval = setInterval(fetchDraftState, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [leagueId, currentUserId, currentManagerId]);

  // Timer countdown
  useEffect(() => {
    if (draftStatus !== "in_progress" || timeRemaining === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [draftStatus, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Use lazy initialization to read from localStorage on mount
  const [autodraftEnabled, setAutodraftEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedAutodraft = localStorage.getItem("autodraftEnabled");
      return savedAutodraft === "true";
    }
    return false;
  });

  const [draftQueue, setDraftQueue] = useState<MLETeam[]>([]);

  const toggleAutodraft = () => {
    const newValue = !autodraftEnabled;
    setAutodraftEnabled(newValue);
    localStorage.setItem("autodraftEnabled", String(newValue));
  };

  // Load queue from localStorage when managerId is available
  useEffect(() => {
    if (currentManagerId && typeof window !== "undefined") {
      const saved = localStorage.getItem(`draftQueue_${currentManagerId}`);
      try {
        setDraftQueue(saved ? JSON.parse(saved) : []);
      } catch {
        setDraftQueue([]);
      }
    }
  }, [currentManagerId]);

  // Sync queue changes to localStorage
  useEffect(() => {
    if (currentManagerId && typeof window !== "undefined") {
      localStorage.setItem(`draftQueue_${currentManagerId}`, JSON.stringify(draftQueue));
    }
  }, [draftQueue, currentManagerId]);

  // Filter and sort state
  const [leagueFilter, setLeagueFilter] = useState<"All" | "Foundation" | "Academy" | "Champion" | "Master" | "Premier">("All");
  const [modeFilter, setModeFilter] = useState<"Both" | "2s" | "3s">("Both");
  const [leagueFilterOpen, setLeagueFilterOpen] = useState(false);
  const [modeFilterOpen, setModeFilterOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<"rank" | "fptsLS" | "avgLS" | "goals" | "shots" | "saves" | "assists" | "demos">("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const currentRoster = mockRosters[selectedManager as keyof typeof mockRosters] || mockRosters["Fantastic Ballers"];

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

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter and sort teams
  const filteredAndSortedTeams = useMemo(() => {
    let filtered = [...availableTeams];

    // Apply league filter
    if (leagueFilter !== "All") {
      const leagueMap = {
        "Foundation": "FL",
        "Academy": "AL",
        "Champion": "CL",
        "Master": "ML",
        "Premier": "PL"
      };
      filtered = filtered.filter(team => team.leagueId === leagueMap[leagueFilter]);
    }

    // Apply mode filter (Note: Mode filter would require mode data on teams)
    // For now, we'll keep this placeholder for future implementation when team mode data is available
    // When implemented, add modeFilter back to the dependency array

    // Apply sorting
    return filtered.sort((a, b) => {
      const aValue = a[sortColumn] as number;
      const bValue = b[sortColumn] as number;
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [leagueFilter, sortColumn, sortDirection]);

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem" }}>
      {/* Team Stats Modal */}
      <DraftTeamModal
        team={showModal && modalTeam ? modalTeam : null}
        onClose={() => setShowModal(false)}
      />

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

      {/* Back Button */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => router.push(`/leagues/${leagueId}/draft`)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            color: "var(--text-main)",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>←</span>
          <span>Back To Draft</span>
        </button>
      </div>

      {/* Header with Timer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
          Available Teams
        </h1>

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          {/* Timer */}
          {draftStatus === "in_progress" && (
            <div style={{
              background: timeRemaining <= 10
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
              padding: "0.75rem 2rem",
              borderRadius: "25px",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#ffffff",
              boxShadow: "0 4px 10px rgba(74, 222, 128, 0.3)"
            }}>
              {formatTime(timeRemaining)}
            </div>
          )}

          {/* Autodraft Button */}
          <button
            onClick={toggleAutodraft}
            style={{
              background: autodraftEnabled
                ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)"
                : "rgba(255,255,255,0.1)",
              border: `2px solid ${autodraftEnabled ? "#f2b632" : "var(--accent)"}`,
              padding: "0.75rem 1.5rem",
              borderRadius: "25px",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: autodraftEnabled ? "#ffffff" : "var(--accent)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: autodraftEnabled
                ? "0 4px 12px rgba(242, 182, 50, 0.4)"
                : "0 2px 8px rgba(242, 182, 50, 0.2)"
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "1.5rem" }}>
        {/* Left Side - Available Teams Table */}
        <div style={{
          background: "linear-gradient(135deg, rgba(50, 50, 60, 0.6) 0%, rgba(40, 40, 50, 0.6) 100%)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.1)",
          overflowX: "auto"
        }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            {/* League Filter */}
            <div style={{ position: "relative", width: "150px" }}>
              <button
                onClick={() => setLeagueFilterOpen(!leagueFilterOpen)}
                style={{
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
                  width: "100%",
                }}
              >
                <span>{leagueFilter === "All" ? "League" : leagueFilter}</span>
                <span style={{ marginLeft: "0.5rem" }}>{leagueFilterOpen ? "▲" : "▼"}</span>
              </button>

              {leagueFilterOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "0.5rem",
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    borderRadius: "6px",
                    padding: "0.5rem 0",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    zIndex: 1000,
                    minWidth: "150px",
                  }}
                >
                  {["All", "Foundation", "Academy", "Champion", "Master", "Premier"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setLeagueFilter(filter as typeof leagueFilter);
                        setLeagueFilterOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.5rem 1rem",
                        background: filter === leagueFilter ? "rgba(255,255,255,0.1)" : "transparent",
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
                        if (filter !== leagueFilter) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mode Filter */}
            <div style={{ position: "relative", width: "120px" }}>
              <button
                onClick={() => setModeFilterOpen(!modeFilterOpen)}
                style={{
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
                  width: "100%",
                }}
              >
                <span>{modeFilter === "Both" ? "Mode" : modeFilter}</span>
                <span style={{ marginLeft: "0.5rem" }}>{modeFilterOpen ? "▲" : "▼"}</span>
              </button>

              {modeFilterOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "0.5rem",
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    borderRadius: "6px",
                    padding: "0.5rem 0",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    zIndex: 1000,
                    minWidth: "120px",
                  }}
                >
                  {["Both", "2s", "3s"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setModeFilter(filter as typeof modeFilter);
                        setModeFilterOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.5rem 1rem",
                        background: filter === modeFilter ? "rgba(255,255,255,0.1)" : "transparent",
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
                        if (filter !== modeFilter) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                <th
                  onClick={() => handleSort("rank")}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  Rank {sortColumn === "rank" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Team</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Action</th>
                <th
                  onClick={() => handleSort("fptsLS")}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  Fpts LS {sortColumn === "fptsLS" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("avgLS")}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  Avg LS {sortColumn === "avgLS" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("goals")}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  Goals {sortColumn === "goals" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("shots")}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  Shots {sortColumn === "shots" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("saves")}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  Saves {sortColumn === "saves" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("assists")}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  Assists {sortColumn === "assists" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("demos")}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  Demos {sortColumn === "demos" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Record</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTeams.map((team) => (
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
                        <div
                          onClick={() => {
                            setModalTeam(team);
                            setShowModal(true);
                          }}
                          style={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "var(--text-main)",
                            cursor: "pointer",
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
                  <td style={{ padding: "0.75rem 1rem", textAlign: "left" }}>
                    {isMyPick && !autodraftEnabled ? (
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
                    ) : (
                      <button
                        onClick={() => {
                          if (!draftQueue.find(t => t.id === team.id)) {
                            setDraftQueue([...draftQueue, team]);
                          }
                        }}
                        disabled={draftQueue.find(t => t.id === team.id) !== undefined}
                        style={{
                          background: draftQueue.find(t => t.id === team.id)
                            ? "rgba(255,255,255,0.1)"
                            : "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)",
                          color: draftQueue.find(t => t.id === team.id) ? "var(--text-muted)" : "#ffffff",
                          padding: "0.5rem 1.5rem",
                          borderRadius: "6px",
                          border: "none",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: draftQueue.find(t => t.id === team.id) ? "not-allowed" : "pointer",
                          boxShadow: draftQueue.find(t => t.id === team.id)
                            ? "none"
                            : "0 2px 8px rgba(242, 182, 50, 0.3)",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (!draftQueue.find(t => t.id === team.id)) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(242, 182, 50, 0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!draftQueue.find(t => t.id === team.id)) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(242, 182, 50, 0.3)";
                          }
                        }}
                      >
                        {draftQueue.find(t => t.id === team.id) ? "Queued" : "Queue"}
                      </button>
                    )}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side - Roster Panel (same as draft page) */}
        <div style={{
          background: "radial-gradient(circle at top left, #1d3258, #020617)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: "1rem",
          maxHeight: "calc(100vh - 2rem)"
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <button
              onClick={() => setRightPanelTab("roster")}
              style={{
                flex: 1,
                padding: "0.5rem 1rem",
                background: rightPanelTab === "roster" ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)" : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              Rosters
            </button>
            <button
              onClick={() => setRightPanelTab("queue")}
              style={{
                flex: 1,
                padding: "0.5rem 1rem",
                background: rightPanelTab === "queue" ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)" : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              Queue ({draftQueue.length})
            </button>
          </div>

          {/* Manager Dropdown (only show for roster tab) */}
          {rightPanelTab === "roster" && (
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
          )}

          {/* Content based on active tab */}
          {rightPanelTab === "roster" && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "8px",
              overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr 80px",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.05)",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  Slot
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  Team
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", textAlign: "right" }}>
                  Pick
                </div>
              </div>

              {/* Roster Slots */}
              {currentRoster.map((slot, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 80px",
                    padding: "0.75rem 1rem",
                    borderBottom: idx < currentRoster.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "center",
                  }}
                >
                  {/* Slot Position */}
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>
                    {slot.slot}
                  </div>

                  {/* Team */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {slot.team ? (
                      <>
                        <Image
                          src={slot.team.logoPath}
                          alt={slot.team.name}
                          width={24}
                          height={24}
                          style={{ borderRadius: "4px", cursor: "pointer" }}
                          onClick={() => {
                            setModalTeam(slot.team);
                            setShowModal(true);
                          }}
                        />
                        <span
                          onClick={() => {
                            setModalTeam(slot.team);
                            setShowModal(true);
                          }}
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "var(--text-main)",
                            cursor: "pointer",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                        >
                          {slot.team.leagueId} {slot.team.name}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>-</span>
                    )}
                  </div>

                  {/* Pick Number */}
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "right" }}>
                    {slot.pick || "-"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Draft Queue Tab */}
          {rightPanelTab === "queue" && (
            <div>
              {draftQueue.length === 0 ? (
                <div style={{
                  padding: "2rem 1rem",
                  textAlign: "center",
                  color: "var(--text-muted)"
                }}>
                  <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>No teams in queue</p>
                  <p style={{ fontSize: "0.85rem" }}>Click &quot;Queue&quot; on teams to add them to your draft queue</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
                        border: "1px solid rgba(255,255,255,0.1)"
                      }}
                    >
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#000"
                      }}>
                        {idx + 1}
                      </div>
                      <Image
                        src={team.logoPath}
                        alt={team.name}
                        width={24}
                        height={24}
                        style={{ borderRadius: "4px", cursor: "pointer" }}
                        onClick={() => {
                          setModalTeam(team);
                          setShowModal(true);
                        }}
                      />
                      <span
                        onClick={() => {
                          setModalTeam(team);
                          setShowModal(true);
                        }}
                        style={{
                          flex: 1,
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "var(--text-main)",
                          cursor: "pointer",
                          transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                      >
                        {team.leagueId} {team.name}
                      </span>

                      {/* Reorder buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <button
                          onClick={() => {
                            if (idx > 0) {
                              const newQueue = [...draftQueue];
                              [newQueue[idx - 1], newQueue[idx]] = [newQueue[idx], newQueue[idx - 1]];
                              setDraftQueue(newQueue);
                            }
                          }}
                          disabled={idx === 0}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: idx === 0 ? "rgba(255,255,255,0.2)" : "var(--text-muted)",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            fontSize: "0.8rem",
                            padding: "0",
                            lineHeight: 1
                          }}
                          onMouseEnter={(e) => {
                            if (idx !== 0) e.currentTarget.style.color = "var(--accent)";
                          }}
                          onMouseLeave={(e) => {
                            if (idx !== 0) e.currentTarget.style.color = "var(--text-muted)";
                          }}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => {
                            if (idx < draftQueue.length - 1) {
                              const newQueue = [...draftQueue];
                              [newQueue[idx], newQueue[idx + 1]] = [newQueue[idx + 1], newQueue[idx]];
                              setDraftQueue(newQueue);
                            }
                          }}
                          disabled={idx === draftQueue.length - 1}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: idx === draftQueue.length - 1 ? "rgba(255,255,255,0.2)" : "var(--text-muted)",
                            cursor: idx === draftQueue.length - 1 ? "not-allowed" : "pointer",
                            fontSize: "0.8rem",
                            padding: "0",
                            lineHeight: 1
                          }}
                          onMouseEnter={(e) => {
                            if (idx !== draftQueue.length - 1) e.currentTarget.style.color = "var(--accent)";
                          }}
                          onMouseLeave={(e) => {
                            if (idx !== draftQueue.length - 1) e.currentTarget.style.color = "var(--text-muted)";
                          }}
                        >
                          ▼
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setDraftQueue(prev => prev.filter((_, i) => i !== idx));
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          padding: "0.25rem"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
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
  );
}
