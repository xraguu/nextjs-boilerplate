"use client";

import { useState, useEffect } from "react";
import { TEAMS, getTeamById } from "@/lib/teams";

interface ManualOverride {
  id: string;
  teamId: string;
  week: number;
  goals: number;
  shots: number;
  saves: number;
  assists: number;
  demosInflicted: number;
  demosTaken: number;
  saveRate: number;
  gameRecord: string;
  createdAt: string;
  updatedAt: string;
}

export default function ManualStatsPage() {
  // Manual stats override state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualOverrides, setManualOverrides] = useState<ManualOverride[]>([]);
  const [loadingOverrides, setLoadingOverrides] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    teamId: "",
    week: 1,
    goals: 0,
    shots: 0,
    saves: 0,
    assists: 0,
    demosInflicted: 0,
    demosTaken: 0,
    saveRate: 0,
    gameRecord: "0-0",
  });

  // Fetch manual overrides on component mount
  useEffect(() => {
    fetchManualOverrides();
  }, []);

  const fetchManualOverrides = async () => {
    setLoadingOverrides(true);
    try {
      const response = await fetch("/api/admin/stats/manual");
      if (response.ok) {
        const data = await response.json();
        setManualOverrides(data.overrides);
      }
    } catch (error) {
      console.error("Failed to fetch manual overrides:", error);
    } finally {
      setLoadingOverrides(false);
    }
  };

  const saveManualOverride = async () => {
    if (!manualFormData.teamId) {
      alert("Please select a team");
      return;
    }

    setSavingManual(true);
    try {
      const response = await fetch("/api/admin/stats/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualFormData),
      });

      if (response.ok) {
        alert("Manual stats saved successfully!");
        setShowManualForm(false);
        fetchManualOverrides(); // Refresh the list
        // Reset form
        setManualFormData({
          teamId: "",
          week: 1,
          goals: 0,
          shots: 0,
          saves: 0,
          assists: 0,
          demosInflicted: 0,
          demosTaken: 0,
          saveRate: 0,
          gameRecord: "0-0",
        });
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to save manual override:", error);
      alert("Failed to save manual stats");
    } finally {
      setSavingManual(false);
    }
  };

  const deleteManualOverride = async (id: string) => {
    if (!confirm("Are you sure you want to delete this manual override? The dataset data will be used instead.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/stats/manual/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Manual override deleted successfully!");
        fetchManualOverrides(); // Refresh the list
      } else {
        alert("Failed to delete manual override");
      }
    } catch (error) {
      console.error("Failed to delete manual override:", error);
      alert("Failed to delete manual override");
    }
  };

  return (
    <div>
      {/* Manual Stats Override Section */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            Manual Stats Overrides
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowManualForm(!showManualForm)}
            style={{ padding: "0.75rem 1.5rem" }}
          >
            {showManualForm ? "Cancel" : "+ Add Manual Stats"}
          </button>
        </div>

        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Manually input stats for a team and week to override dataset data. Useful when the dataset is slow or has errors.
        </p>

        {/* Manual Input Form */}
        {showManualForm && (
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem", color: "var(--text-main)" }}>
              Add/Edit Manual Stats
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              {/* Team Selector */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  MLE Team *
                </label>
                <select
                  value={manualFormData.teamId}
                  onChange={(e) => setManualFormData({ ...manualFormData, teamId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="">Select Team</option>
                  {TEAMS.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.leagueId} - {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Week Selector */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Week *
                </label>
                <select
                  value={manualFormData.week}
                  onChange={(e) => setManualFormData({ ...manualFormData, week: parseInt(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                >
                  {Array.from({ length: 14 }, (_, i) => i + 1).map((week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Input Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Goals
                </label>
                <input
                  type="number"
                  value={manualFormData.goals}
                  onChange={(e) => setManualFormData({ ...manualFormData, goals: parseInt(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Shots
                </label>
                <input
                  type="number"
                  value={manualFormData.shots}
                  onChange={(e) => setManualFormData({ ...manualFormData, shots: parseInt(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Saves
                </label>
                <input
                  type="number"
                  value={manualFormData.saves}
                  onChange={(e) => setManualFormData({ ...manualFormData, saves: parseInt(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Assists
                </label>
                <input
                  type="number"
                  value={manualFormData.assists}
                  onChange={(e) => setManualFormData({ ...manualFormData, assists: parseInt(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Demos Inflicted
                </label>
                <input
                  type="number"
                  value={manualFormData.demosInflicted}
                  onChange={(e) => setManualFormData({ ...manualFormData, demosInflicted: parseInt(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Demos Taken
                </label>
                <input
                  type="number"
                  value={manualFormData.demosTaken}
                  onChange={(e) => setManualFormData({ ...manualFormData, demosTaken: parseInt(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Sprocket Rating (SR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={manualFormData.saveRate}
                  onChange={(e) => setManualFormData({ ...manualFormData, saveRate: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Game Record (W-L)
                </label>
                <input
                  type="text"
                  value={manualFormData.gameRecord}
                  onChange={(e) => setManualFormData({ ...manualFormData, gameRecord: e.target.value })}
                  placeholder="9-4"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>

            <button
              className="btn btn-success"
              onClick={saveManualOverride}
              disabled={savingManual}
              style={{ width: "100%", padding: "1rem", fontSize: "1rem", fontWeight: 700 }}
            >
              {savingManual ? "Saving..." : "Save Manual Stats"}
            </button>
          </div>
        )}

        {/* Manual Overrides Table */}
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-main)" }}>
            Current Manual Overrides ({manualOverrides.length})
          </h3>

          {loadingOverrides ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading...</p>
          ) : manualOverrides.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              No manual overrides yet. Add one above to override dataset stats.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Week</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Goals</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Shots</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Saves</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Assists</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>D.Inf</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>D.Tkn</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>SR%</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manualOverrides.map((override) => {
                    const team = getTeamById(override.teamId);
                    return (
                      <tr key={override.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                          {team ? `${team.leagueId} ${team.name}` : override.teamId}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: 600 }}>
                          {override.week}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          {override.goals}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          {override.shots}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          {override.saves}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          {override.assists}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          {override.demosInflicted}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          {override.demosTaken}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", color: "var(--accent)", fontWeight: 600 }}>
                          {override.saveRate}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          {override.gameRecord}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          <button
                            onClick={() => deleteManualOverride(override.id)}
                            style={{
                              padding: "0.5rem 1rem",
                              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
