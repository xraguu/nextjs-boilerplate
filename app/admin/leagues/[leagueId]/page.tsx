"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface User {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  discordId: string;
}

interface FantasyTeam {
  id: string;
  displayName: string;
  shortCode: string;
  draftPosition: number | null;
  faabRemaining: number | null;
  waiverPriority: number | null;
  owner: User;
  roster: { id: string; week: number }[];
}

interface League {
  id: string;
  name: string;
  season: number;
  maxTeams: number;
  currentWeek: number;
  draftType: string;
  waiverSystem: string;
  faabBudget: number | null;
  rosterConfig: any;
  draftStatus: string | null;
  draftPickDeadline: string | null;
  draftPickTimeSeconds: number | null;
  fantasyTeams: FantasyTeam[];
  draftPicks: any[];
  _count: {
    fantasyTeams: number;
    draftPicks: number;
    matchups: number;
    trades: number;
    waivers: number;
  };
}

export default function AdminLeagueManagementPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params?.leagueId as string;

  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [shortCode, setShortCode] = useState("");

  useEffect(() => {
    fetchLeague();
    fetchAllUsers();
  }, [leagueId]);

  const fetchLeague = async () => {
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`);
      if (!response.ok) throw new Error("Failed to fetch league");
      const data = await response.json();
      setLeague(data.league);
    } catch (error) {
      console.error("Error fetching league:", error);
      alert("Failed to load league");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setAllUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          teamName,
          shortCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add user");
      }

      alert("User added to league successfully!");
      setShowAddUserModal(false);
      setSelectedUserId("");
      setTeamName("");
      setShortCode("");
      fetchLeague();
    } catch (error: any) {
      console.error("Error adding user:", error);
      alert(error.message || "Failed to add user");
    }
  };

  const handleRemoveTeam = async (teamId: string, teamName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${teamName} from the league? This will delete all their roster data, trades, and waiver claims.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/leagues/${leagueId}/teams/${teamId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove team");
      }

      alert("Team removed successfully!");
      fetchLeague();
    } catch (error: any) {
      console.error("Error removing team:", error);
      alert(error.message || "Failed to remove team");
    }
  };

  const moveTeamUp = (index: number) => {
    if (index === 0) return; // Already at the top

    const newTeams = [...league!.fantasyTeams];
    const temp = newTeams[index - 1];
    newTeams[index - 1] = newTeams[index];
    newTeams[index] = temp;

    // Update local state immediately for smooth UX
    setLeague({
      ...league!,
      fantasyTeams: newTeams,
    });

    // Update positions in backend
    updateTeamOrder(newTeams);
  };

  const moveTeamDown = (index: number) => {
    if (index === league!.fantasyTeams.length - 1) return; // Already at the bottom

    const newTeams = [...league!.fantasyTeams];
    const temp = newTeams[index + 1];
    newTeams[index + 1] = newTeams[index];
    newTeams[index] = temp;

    // Update local state immediately for smooth UX
    setLeague({
      ...league!,
      fantasyTeams: newTeams,
    });

    // Update positions in backend
    updateTeamOrder(newTeams);
  };

  const updateTeamOrder = async (orderedTeams: FantasyTeam[]) => {
    try {
      const teamOrders = orderedTeams.map((team, index) => ({
        teamId: team.id,
        draftPosition: index + 1,
      }));

      const response = await fetch(`/api/admin/leagues/${leagueId}/reorder-teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamOrders }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update draft order");
      }

      // Optionally refetch to ensure consistency
      fetchLeague();
    } catch (error: any) {
      console.error("Error updating draft order:", error);
      alert(error.message || "Failed to update draft order");
      // Revert on error
      fetchLeague();
    }
  };

  const handleInitializeDraft = async () => {
    if (
      !confirm(
        "This will create all draft picks AND START THE DRAFT. Make sure all teams have draft positions assigned and everyone is ready. Continue?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/leagues/${leagueId}/initialize-draft`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initialize draft");
      }

      const data = await response.json();
      alert(data.message || "Draft started successfully!");
      fetchLeague();
    } catch (error: any) {
      console.error("Error initializing draft:", error);
      alert(error.message || "Failed to initialize draft");
    }
  };

  const handleDeleteLeague = async () => {
    if (
      !confirm(
        `Are you sure you want to DELETE the entire league "${league?.name}"? This action cannot be undone and will remove all teams, drafts, matchups, and data.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete league");
      }

      alert("League deleted successfully!");
      router.push("/admin/leagues");
    } catch (error: any) {
      console.error("Error deleting league:", error);
      alert(error.message || "Failed to delete league");
    }
  };

  // Filter out users who are already in the league
  const availableUsers = allUsers.filter(
    (user) => !league?.fantasyTeams.some((team) => team.owner.id === user.id)
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>
          Loading league...
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>League not found</h2>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/admin/leagues")}
          style={{ marginTop: "1rem" }}
        >
          Back to Leagues
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Add User Modal */}
      {showAddUserModal && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowAddUserModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 999,
            }}
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
                Add User to League
              </h2>
              <form onSubmit={handleAddUser}>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Select User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: "var(--text-main)",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                    }}
                    required
                  >
                    <option value="">-- Select a user --</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName} ({user.discordId})
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
                    Team Name
                  </label>
                  <input
                    type="text"
                    placeholder="My Fantasy Team"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
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
                    Short Code (3 characters)
                  </label>
                  <input
                    type="text"
                    placeholder="ABC"
                    value={shortCode}
                    onChange={(e) =>
                      setShortCode(e.target.value.toUpperCase().slice(0, 3))
                    }
                    maxLength={3}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: "var(--text-main)",
                      fontSize: "0.95rem",
                      textTransform: "uppercase",
                    }}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setShowAddUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          className="btn btn-ghost"
          onClick={() => router.push("/admin/leagues")}
          style={{ marginBottom: "1rem" }}
        >
          ← Back to Leagues
        </button>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--accent)",
            marginBottom: "0.5rem",
          }}
        >
          {league.name}
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Season {league.season} • {league.draftType === "snake" ? "Snake" : "Linear"}{" "}
          Draft • {league.waiverSystem === "faab" ? "FAAB" : league.waiverSystem}{" "}
          Waivers
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            Teams
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {league._count.fantasyTeams}/{league.maxTeams}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            Draft Status
          </div>
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color:
                league.draftStatus === "in_progress"
                  ? "#d4af37"
                  : league.draftStatus === "completed"
                  ? "#22c55e"
                  : "#9ca3af",
              textTransform: "capitalize",
            }}
          >
            {league.draftStatus?.replace("_", " ") || "Not Started"}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            Draft Picks
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#22c55e",
            }}
          >
            {league._count.draftPicks}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            Current Week
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#3b82f6",
            }}
          >
            {league.currentWeek}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            Matchups
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#ef4444",
            }}
          >
            {league._count.matchups}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() => setShowAddUserModal(true)}
          disabled={league._count.fantasyTeams >= league.maxTeams}
        >
          + Add User to League
        </button>
        <button
          className="btn"
          onClick={handleInitializeDraft}
          disabled={
            league._count.draftPicks > 0 ||
            league.draftStatus === "in_progress" ||
            league.draftStatus === "completed"
          }
          style={{
            background:
              league.draftStatus === "in_progress" ||
              league.draftStatus === "completed" ||
              league._count.draftPicks > 0
                ? "#4b5563"
                : "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)",
            cursor:
              league._count.draftPicks > 0 ||
              league.draftStatus === "in_progress" ||
              league.draftStatus === "completed"
                ? "not-allowed"
                : "pointer",
            boxShadow:
              league._count.draftPicks === 0 && league.draftStatus !== "in_progress"
                ? "0 4px 12px rgba(242, 182, 50, 0.4)"
                : "none",
          }}
        >
          {league.draftStatus === "in_progress"
            ? "🟢 Draft In Progress"
            : league.draftStatus === "completed"
            ? "✅ Draft Completed"
            : league._count.draftPicks > 0
            ? "Draft Already Started"
            : "🚀 Initialize & Start Draft"}
        </button>
        <button
          className="btn"
          onClick={() => router.push(`/leagues/${leagueId}/draft`)}
          style={{ background: "#3b82f6" }}
        >
          View Draft Page
        </button>
        <button
          className="btn"
          onClick={handleDeleteLeague}
          style={{ background: "#ef4444", marginLeft: "auto" }}
        >
          Delete League
        </button>
      </div>

      {/* Draft Order Section */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-main)",
              margin: 0,
            }}
          >
            Draft Order
          </h2>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Use ↑↓ arrows to reorder teams
          </div>
        </div>

        {league.fantasyTeams.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--text-muted)",
            }}
          >
            No teams in this league yet. Click "Add User to League" to get started.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {league.fantasyTeams.map((team, index) => (
              <div
                key={team.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Draft Position Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: "#ffffff",
                    boxShadow: "0 2px 8px rgba(212, 175, 55, 0.3)",
                  }}
                >
                  {index + 1}
                </div>

                {/* Team Info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {team.owner.avatarUrl && (
                      <img
                        src={team.owner.avatarUrl}
                        alt={team.owner.displayName}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "var(--text-main)",
                        }}
                      >
                        {team.displayName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {team.owner.displayName} • {team.shortCode}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reorder Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <button
                    onClick={() => moveTeamUp(index)}
                    disabled={index === 0}
                    style={{
                      background:
                        index === 0
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "4px",
                      color: index === 0 ? "var(--text-muted)" : "var(--text-main)",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (index !== 0) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== 0) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveTeamDown(index)}
                    disabled={index === league.fantasyTeams.length - 1}
                    style={{
                      background:
                        index === league.fantasyTeams.length - 1
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "4px",
                      color:
                        index === league.fantasyTeams.length - 1
                          ? "var(--text-muted)"
                          : "var(--text-main)",
                      cursor:
                        index === league.fantasyTeams.length - 1
                          ? "not-allowed"
                          : "pointer",
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (index !== league.fantasyTeams.length - 1) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== league.fantasyTeams.length - 1) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    ↓
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  className="btn btn-ghost"
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => handleRemoveTeam(team.id, team.displayName)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
