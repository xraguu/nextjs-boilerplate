"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import TeamModal from "@/components/TeamModal";

// Types
interface DraftPick {
  id: string;
  round: number;
  pickNumber: number;
  overallPick: number;
  fantasyTeamId: string | null;
  mleTeamId: string | null;
  pickedAt: Date | null;
}

interface MLETeam {
  id: string;
  name: string;
  leagueId: string;
  slug: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
}

interface FantasyTeam {
  id: string;
  displayName: string;
  shortCode: string;
  draftPosition: number | null;
  ownerUserId: string;
  ownerDisplayName: string;
  ownerDiscordId: string;
  roster: Array<{
    week: number;
    position: string;
    slotIndex: number;
    mleTeamId: string;
    mleTeam: MLETeam | null;
  }>;
}

interface DraftState {
  leagueId: string;
  leagueName: string;
  draftType: string;
  status: "not_started" | "in_progress" | "paused" | "completed";
  currentPickNumber: number | null;
  currentPickDeadline: string | null;
  pickTimeSeconds: number;
  picks: DraftPick[];
  fantasyTeams: FantasyTeam[];
  availableTeams: MLETeam[];
}

export default function DraftPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.LeagueID as string;

  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<MLETeam | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"rosters" | "teams" | "queue">("rosters");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Draft queue and autodraft (stored in localStorage)
  const [draftQueue, setDraftQueue] = useState<MLETeam[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(`draftQueue_${leagueId}`);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [autodraftEnabled, setAutodraftEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`autodraft_${leagueId}`) === "true";
  });

  // Save queue to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`draftQueue_${leagueId}`, JSON.stringify(draftQueue));
    }
  }, [draftQueue, leagueId]);

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

  // Fetch draft state
  const fetchDraftState = useCallback(async () => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/draft`);
      if (!response.ok) {
        throw new Error("Failed to fetch draft state");
      }
      const data = await response.json();
      setDraftState(data);

      // Set default selected manager to first team
      if (!selectedManager && data.fantasyTeams.length > 0) {
        setSelectedManager(data.fantasyTeams[0].displayName);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load draft");
    } finally {
      setLoading(false);
    }
  }, [leagueId, selectedManager]);

  // Initial fetch
  useEffect(() => {
    fetchDraftState();
  }, [fetchDraftState]);

  // Polling for updates (every 3 seconds when draft is active)
  useEffect(() => {
    if (!draftState || draftState.status !== "in_progress") return;

    const interval = setInterval(fetchDraftState, 3000);
    return () => clearInterval(interval);
  }, [draftState, fetchDraftState]);

  // Timer countdown
  useEffect(() => {
    if (!draftState?.currentPickDeadline) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const deadline = new Date(draftState.currentPickDeadline!).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setTimeRemaining(remaining);

      // Auto-pick if time runs out and autodraft is enabled
      if (remaining === 0 && autodraftEnabled && draftState.status === "in_progress") {
        const currentPick = draftState.picks.find((p) => !p.pickedAt);
        if (currentPick) {
          // Check if it's the user's pick
          // handleAutoPick();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [draftState, autodraftEnabled]);

  const toggleAutodraft = () => {
    const newValue = !autodraftEnabled;
    setAutodraftEnabled(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem(`autodraft_${leagueId}`, String(newValue));
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>Loading draft...</div>
      </div>
    );
  }

  if (error || !draftState) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#ef4444", fontSize: "1.2rem" }}>Error: {error || "Draft not found"}</div>
      </div>
    );
  }

  const currentTeam = draftState.fantasyTeams.find((t) => t.displayName === selectedManager);
  const currentRoster = currentTeam?.roster || [];

  // Find current user's fantasy team
  const currentUserTeam = draftState.fantasyTeams.find((t) => t.ownerUserId === currentUserId);

  // Find current pick
  const currentPick = draftState.picks.find((pick) => pick.overallPick === draftState.currentPickNumber);

  // Check if it's the current user's turn
  const isMyTurn = currentUserTeam && currentPick && currentPick.fantasyTeamId === currentUserTeam.id;

  // Get the fantasy team whose turn it is
  const currentPickTeam = currentPick ? draftState.fantasyTeams.find((t) => t.id === currentPick.fantasyTeamId) : null;

  // Determine pick status
  const getPickStatus = (pick: DraftPick): "picked" | "current" | "upcoming" => {
    if (pick.pickedAt) return "picked";
    if (pick.overallPick === draftState.currentPickNumber) return "current";
    return "upcoming";
  };

  // Get team by ID from available or picked teams
  const getTeamById = (teamId: string): MLETeam | undefined => {
    return draftState.availableTeams.find((t) => t.id === teamId) ||
           draftState.picks.find((p) => p.mleTeamId === teamId)
             ? ({ id: teamId } as MLETeam) // Simplified, you'd need full data
             : undefined;
  };

  const getFantasyTeamById = (teamId: string): FantasyTeam | undefined => {
    return draftState.fantasyTeams.find((t) => t.id === teamId);
  };

  return (
    <div>
      {/* Team Stats Modal */}
      <TeamModal
        team={showModal && selectedTeam ? {
          ...selectedTeam,
          teamPrimaryColor: selectedTeam.primaryColor,
          teamSecondaryColor: selectedTeam.secondaryColor,
        } : null}
        onClose={() => setShowModal(false)}
        isDraftContext={true}
      />

      <div style={{ minHeight: "100vh", padding: "2rem 1rem" }}>
        {/* Header with Timer and Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
              Draft Room
            </h1>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              {draftState.leagueName} • {draftState.draftType === "snake" ? "Snake" : "Linear"} Draft •{" "}
              <span style={{ textTransform: "capitalize" }}>{draftState.status.replace("_", " ")}</span>
            </div>
            {draftState.status === "in_progress" && currentPickTeam && (
              <div
                style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem 1.25rem",
                  background: isMyTurn
                    ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)"
                    : "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  border: isMyTurn ? "2px solid #f2b632" : "1px solid rgba(255,255,255,0.2)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: isMyTurn ? "#ffffff" : "var(--text-main)",
                  boxShadow: isMyTurn ? "0 4px 12px rgba(242, 182, 50, 0.4)" : "none",
                }}
              >
                {isMyTurn ? (
                  <>🎯 YOUR TURN TO PICK! ({currentPickTeam.displayName})</>
                ) : (
                  <>On the clock: {currentPickTeam.displayName} ({currentPickTeam.ownerDisplayName})</>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            {/* Timer */}
            {draftState.status === "in_progress" && (
              <div
                style={{
                  background: timeRemaining <= 10
                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                    : "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                  padding: "0.75rem 2rem",
                  borderRadius: "25px",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#ffffff",
                  boxShadow: "0 4px 10px rgba(74, 222, 128, 0.3)",
                }}
              >
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
                  : "0 2px 8px rgba(242, 182, 50, 0.2)",
              }}
            >
              Autodraft {autodraftEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1rem" }}>
          {/* Left Side - Draft Picks */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Recent Picks */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(50, 50, 60, 0.6) 0%, rgba(40, 40, 50, 0.6) 100%)",
                borderRadius: "12px",
                padding: "1rem",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-main)" }}>
                Recent Picks
              </h3>
              <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {draftState.picks.slice(0, 5).map((pick) => {
                  const status = getPickStatus(pick);
                  const team = pick.mleTeamId ? getTeamById(pick.mleTeamId) : null;
                  const fantasyTeam = pick.fantasyTeamId ? getFantasyTeamById(pick.fantasyTeamId) : null;

                  return (
                    <div
                      key={pick.id}
                      style={{
                        minWidth: "160px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        border: `2px solid ${
                          status === "current" ? "#4ade80" : status === "picked" ? "var(--accent)" : "rgba(255,255,255,0.1)"
                        }`,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                          Pick {pick.round}.{pick.pickNumber}
                        </div>
                        {team ? (
                          <>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.2rem" }}>
                              {team.leagueId} {team.name}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                              {fantasyTeam?.displayName}
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)" }}>
                            {status === "current" ? "On the Clock" : "Upcoming"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Draft Grid */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(50, 50, 60, 0.6) 0%, rgba(40, 40, 50, 0.6) 100%)",
                borderRadius: "12px",
                padding: "1rem",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {/* Round Headers */}
                <div style={{ display: "flex", gap: "0.25rem", position: "sticky", top: 0, zIndex: 10, background: "rgba(40, 40, 50, 0.95)", paddingBottom: "0.5rem" }}>
                  <div style={{ width: "150px", flexShrink: 0 }}></div>
                  {[...new Set(draftState.picks.map((p) => p.round))].slice(0, 8).map((round) => (
                    <div
                      key={round}
                      style={{
                        flex: 1,
                        minWidth: "60px",
                        maxWidth: "80px",
                        padding: "0.5rem 0.25rem",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textAlign: "center",
                        color: "var(--accent)",
                      }}
                    >
                      <div>R{round}</div>
                    </div>
                  ))}
                </div>

                {/* Team Rows */}
                {draftState.fantasyTeams.map((fantasyTeam) => (
                  <div key={fantasyTeam.id} style={{ display: "flex", gap: "0.25rem" }}>
                    <div
                      style={{
                        width: "150px",
                        flexShrink: 0,
                        padding: "0.5rem",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: fantasyTeam.displayName === selectedManager ? "var(--accent)" : "var(--text-main)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {fantasyTeam.displayName}
                      </span>
                    </div>

                    {[...new Set(draftState.picks.map((p) => p.round))].slice(0, 8).map((round) => {
                      const pick = draftState.picks.find(
                        (p) => p.round === round && p.fantasyTeamId === fantasyTeam.id
                      );
                      const status = pick ? getPickStatus(pick) : "upcoming";
                      const team = pick?.mleTeamId ? getTeamById(pick.mleTeamId) : null;

                      return (
                        <div
                          key={round}
                          style={{
                            flex: 1,
                            minWidth: "60px",
                            maxWidth: "80px",
                            padding: "0.5rem 0.25rem",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "6px",
                            border: `2px solid ${
                              status === "current" ? "#4ade80" : status === "picked" ? "var(--accent)" : "rgba(255,255,255,0.1)"
                            }`,
                            minHeight: "50px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            color: "var(--text-main)",
                            overflow: "hidden",
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                            {team ? `${team.leagueId} ${team.name}` : status === "current" ? "Clock" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Roster/Teams/Queue Panel */}
          <div
            style={{
              background: "radial-gradient(circle at top left, #1d3258, #020617)",
              borderRadius: "12px",
              padding: "1rem",
              border: "1px solid rgba(255,255,255,0.1)",
              position: "sticky",
              top: "1rem",
              maxHeight: "calc(100vh - 2rem)",
              overflowY: "auto",
            }}
          >
            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {(["rosters", "teams", "queue"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightPanelTab(tab)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.75rem",
                    background:
                      rightPanelTab === tab
                        ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)"
                        : "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textTransform: "capitalize",
                  }}
                >
                  {tab} {tab === "queue" && `(${draftQueue.length})`}
                </button>
              ))}
            </div>

            {/* Manager Dropdown */}
            {rightPanelTab === "rosters" && (
              <div style={{ position: "relative", marginBottom: "1rem" }}>
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
                      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                      borderRadius: "8px",
                      padding: "0.5rem 0",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                      zIndex: 1000,
                    }}
                  >
                    {draftState.fantasyTeams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => {
                          setSelectedManager(team.displayName);
                          setDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          background: team.displayName === selectedManager ? "rgba(255,255,255,0.1)" : "transparent",
                          border: "none",
                          color: "#ffffff",
                          textAlign: "left",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {team.displayName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Roster Tab Content */}
            {rightPanelTab === "rosters" && (
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {currentRoster.length} teams drafted
                </div>
                {currentRoster.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No teams drafted yet
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {currentRoster.map((slot, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "6px",
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", minWidth: "40px" }}>
                          {slot.position.toUpperCase()}
                        </div>
                        {slot.mleTeam && (
                          <>
                            <Image src={slot.mleTeam.logoPath} alt={slot.mleTeam.name} width={24} height={24} />
                            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>
                              {slot.mleTeam.leagueId} {slot.mleTeam.name}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Teams Tab */}
            {rightPanelTab === "teams" && (
              <div>
                <button
                  onClick={() => isMyTurn && router.push(`/leagues/${leagueId}/draft/make-pick`)}
                  disabled={!isMyTurn}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: isMyTurn
                      ? "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)"
                      : "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: "8px",
                    color: isMyTurn ? "#ffffff" : "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: isMyTurn ? "pointer" : "not-allowed",
                    marginBottom: "1rem",
                    opacity: isMyTurn ? 1 : 0.5,
                    transition: "all 0.2s ease",
                  }}
                  title={isMyTurn ? "Make your pick" : "Wait for your turn"}
                >
                  {isMyTurn ? "Make Pick" : "Not Your Turn"}
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {draftState.availableTeams.map((team) => (
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
                      }}
                    >
                      <Image src={team.logoPath} alt={team.name} width={24} height={24} />
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>
                        {team.leagueId} {team.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Queue Tab */}
            {rightPanelTab === "queue" && (
              <div>
                {draftQueue.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No teams in queue
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
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "var(--accent)", minWidth: "24px" }}>#{idx + 1}</div>
                        <Image src={team.logoPath} alt={team.name} width={24} height={24} />
                        <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {team.leagueId} {team.name}
                        </span>
                        <button
                          onClick={() => setDraftQueue((prev) => prev.filter((_, i) => i !== idx))}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                          }}
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
