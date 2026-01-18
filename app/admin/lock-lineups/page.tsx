"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function LockLineupsPage() {
  const [currentWeek, setCurrentWeek] = useState(3);
  const [lineups, setLineups] = useState<any[]>([]);
  const [filterLeague, setFilterLeague] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any | null>(null);
  const [managerRoster, setManagerRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<any[]>([]);

  // Fetch lineups when week or league filter changes
  useEffect(() => {
    const fetchLineups = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          week: currentWeek.toString(),
        });
        if (filterLeague !== "all") {
          params.append("leagueId", filterLeague);
        }

        const response = await fetch(
          `/api/admin/weeks/lock-lineups?${params}`
        );
        if (!response.ok) throw new Error("Failed to fetch lineups");

        const data = await response.json();
        setLineups(data.lineups || []);
      } catch (error) {
        console.error("Error fetching lineups:", error);
        alert("Failed to fetch lineups");
      } finally {
        setLoading(false);
      }
    };

    fetchLineups();
  }, [currentWeek, filterLeague]);

  // Fetch available leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch("/api/leagues");
        if (!response.ok) throw new Error("Failed to fetch leagues");

        const data = await response.json();
        setLeagues(data.leagues || []);
      } catch (error) {
        console.error("Error fetching leagues:", error);
      }
    };

    fetchLeagues();
  }, []);

  const lockAll = async () => {
    try {
      const response = await fetch("/api/admin/weeks/lock-lineups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week: currentWeek,
          action: "lock",
          leagueId: filterLeague,
        }),
      });

      if (!response.ok) throw new Error("Failed to lock all lineups");

      setShowConfirmModal(false);
      alert("All lineups have been locked!");

      // Refresh data
      const params = new URLSearchParams({ week: currentWeek.toString() });
      if (filterLeague !== "all") params.append("leagueId", filterLeague);
      const refreshResponse = await fetch(
        `/api/admin/weeks/lock-lineups?${params}`
      );
      const data = await refreshResponse.json();
      setLineups(data.lineups || []);
    } catch (error) {
      console.error("Error locking lineups:", error);
      alert("Failed to lock lineups");
    }
  };

  const openRosterModal = (manager: any) => {
    setSelectedManager(manager);
    setManagerRoster(manager.slots || []);
    setShowRosterModal(true);
  };

  const toggleTeamLock = (index: number) => {
    setManagerRoster((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, isLocked: !slot.isLocked } : slot
      )
    );
  };

  const lockWholeRoster = () => {
    setManagerRoster((prev) =>
      prev.map((slot) => ({ ...slot, isLocked: true }))
    );
  };

  const saveRosterLocks = async () => {
    try {
      const slotIds = managerRoster.map((slot) => slot.id);
      const allLocked = managerRoster.every((slot) => slot.isLocked);

      const response = await fetch("/api/admin/weeks/lock-lineups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week: currentWeek,
          action: allLocked ? "lock" : "unlock",
          fantasyTeamId: selectedManager?.fantasyTeamId,
        }),
      });

      if (!response.ok) throw new Error("Failed to save roster locks");

      setShowRosterModal(false);
      alert("Roster locks updated!");

      // Refresh data
      const params = new URLSearchParams({ week: currentWeek.toString() });
      if (filterLeague !== "all") params.append("leagueId", filterLeague);
      const refreshResponse = await fetch(
        `/api/admin/weeks/lock-lineups?${params}`
      );
      const data = await refreshResponse.json();
      setLineups(data.lineups || []);
    } catch (error) {
      console.error("Error saving roster locks:", error);
      alert("Failed to save roster locks");
    }
  };

  const filteredLineups =
    filterLeague === "all"
      ? lineups
      : lineups.filter((lineup) => lineup.league === filterLeague);

  const lockedCount = filteredLineups.filter((l) => l.locked).length;
  const unlockedCount = filteredLineups.length - lockedCount;

  return (
    <div>
      {/* Roster Lock Modal */}
      {showRosterModal && selectedManager && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowRosterModal(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              maxWidth: "900px",
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)", marginBottom: "0.25rem" }}>
                    {selectedManager.teamName}
                  </h2>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Manager: {selectedManager.manager} | League: {selectedManager.league}
                  </p>
                </div>
                <button
                  className="btn btn-warning"
                  onClick={lockWholeRoster}
                >
                  Lock Whole Roster
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Slot
                    </th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Team
                    </th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Status
                    </th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {managerRoster.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "var(--accent)", fontWeight: 600 }}>
                        {item.position}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        {item.mleTeam ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <Image
                              src={item.mleTeam.logoPath}
                              alt={item.mleTeam.name}
                              width={32}
                              height={32}
                              style={{ borderRadius: "4px" }}
                            />
                            <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                              {item.mleTeam.leagueId} {item.mleTeam.name}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                            Empty Slot
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                        <div style={{ width: "100%", maxWidth: "120px", margin: "0 auto" }}>
                          <div style={{
                            width: "100%",
                            height: "6px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "3px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              width: item.isLocked ? "100%" : "0%",
                              height: "100%",
                              background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                              transition: "width 0.3s ease"
                            }} />
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            {item.isLocked ? "Locked" : "Unlocked"}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                        <button
                          className={item.isLocked ? "btn btn-ghost" : "btn btn-warning"}
                          style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                          onClick={() => toggleTeamLock(index)}
                        >
                          {item.isLocked ? "Unlock" : "Lock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowRosterModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveRosterLocks}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowConfirmModal(false)}
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
                  marginBottom: "1rem",
                  color: "var(--accent)",
                }}
              >
                Confirm Lock All Lineups
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--text-muted)",
                  marginBottom: "2rem",
                  lineHeight: 1.6,
                }}
              >
                Are you sure you want to lock all lineups for Week {currentWeek}?
                This will prevent managers from making any further changes to
                their rosters.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-warning"
                  style={{ flex: 1 }}
                  onClick={lockAll}
                >
                  Lock All Lineups
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Week Selector and Lock All Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              Current Week
            </label>
            <select
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "1.1rem",
                fontWeight: 700,
              }}
            >
              {Array.from({ length: 14 }, (_, i) => i + 1).map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              Filter by League
            </label>
            <select
              value={filterLeague}
              onChange={(e) => setFilterLeague(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              <option value="all">All Leagues</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-warning"
          style={{ padding: "0.75rem 2rem", fontSize: "1.05rem" }}
          onClick={() => setShowConfirmModal(true)}
        >
          Lock All Lineups
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
            Total Teams
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {filteredLineups.length}
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
            Locked
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#22c55e",
            }}
          >
            {lockedCount}
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
            Unlocked
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#ef4444",
            }}
          >
            {unlockedCount}
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
            Lock Progress
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {Math.round((lockedCount / filteredLineups.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Lineups Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
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
                Manager
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
                Fantasy Team
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
                League
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
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Last Updated
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
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  Loading lineups...
                </td>
              </tr>
            ) : filteredLineups.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No lineups found for week {currentWeek}
                </td>
              </tr>
            ) : (
              filteredLineups.map((lineup) => (
              <tr
                key={lineup.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                  {lineup.manager}
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  {lineup.teamName}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {lineup.league}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <div style={{ width: "100%", maxWidth: "150px", margin: "0 auto" }}>
                    <div style={{
                      width: "100%",
                      height: "8px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "4px",
                      overflow: "hidden",
                      position: "relative"
                    }}>
                      <div style={{
                        width: lineup.locked ? "100%" : "0%",
                        height: "100%",
                        background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                    <div style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "0.25rem",
                      textAlign: "center"
                    }}>
                      {lineup.locked ? "Locked" : "Unlocked"}
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {lineup.lastUpdated}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "right",
                  }}
                >
                  <button
                    className="btn btn-primary"
                    style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                    onClick={() => openRosterModal(lineup)}
                  >
                    Manage Locks
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
