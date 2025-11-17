"use client";

import { useState } from "react";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";

// Mock roster data for modal
const generateMockRoster = (managerName: string) => {
  return [
    { slot: "2s", team: TEAMS[0], locked: false },
    { slot: "2s", team: TEAMS[1], locked: true },
    { slot: "3s", team: TEAMS[2], locked: false },
    { slot: "3s", team: TEAMS[3], locked: true },
    { slot: "FLX", team: TEAMS[4], locked: false },
    { slot: "BE", team: TEAMS[5], locked: false },
    { slot: "BE", team: TEAMS[6], locked: true },
    { slot: "BE", team: TEAMS[7], locked: false },
  ];
};

// Mock lineup status data
const mockLineupStatus = [
  { id: "1", fantasyTeamId: "test-2025-nick", manager: "Nick", teamName: "Nick's Bumps", league: "2025-alpha", week: 3, locked: false, lastUpdated: "2025-11-16 2:30 PM" },
  { id: "2", fantasyTeamId: "test-2025-rover", manager: "Rover", teamName: "Rover's Rockets", league: "2025-alpha", week: 3, locked: true, lastUpdated: "2025-11-15 10:15 AM" },
  { id: "3", fantasyTeamId: "test-2025-flip", manager: "FlipReset", teamName: "Ceiling Shot Squad", league: "2025-alpha", week: 3, locked: true, lastUpdated: "2025-11-15 11:30 AM" },
  { id: "4", fantasyTeamId: "test-2025-air", manager: "AirDribbler", teamName: "Musty Flick Masters", league: "2025-beta", week: 3, locked: false, lastUpdated: "2025-11-16 1:45 PM" },
  { id: "5", fantasyTeamId: "test-2025-speed", manager: "SpeedDemon", teamName: "Boost Stealers", league: "2025-beta", week: 3, locked: true, lastUpdated: "2025-11-15 9:20 AM" },
  { id: "6", fantasyTeamId: "test-2025-musty", manager: "MustyCrew", teamName: "Demo Kings", league: "2025-alpha", week: 3, locked: false, lastUpdated: "2025-11-16 3:10 PM" },
  { id: "7", fantasyTeamId: "test-2025-ceiling", manager: "CeilingShotz", teamName: "Aerial Aces", league: "2025-beta", week: 3, locked: true, lastUpdated: "2025-11-15 8:45 AM" },
  { id: "8", fantasyTeamId: "test-2025-wave", manager: "WaveDash", teamName: "Speed Flip Squad", league: "2025-gamma", week: 3, locked: false, lastUpdated: "2025-11-16 12:00 PM" },
  { id: "9", fantasyTeamId: "test-2025-flip2", manager: "FlipMaster", teamName: "Reset Rookies", league: "2025-gamma", week: 3, locked: true, lastUpdated: "2025-11-15 7:30 AM" },
  { id: "10", fantasyTeamId: "test-2025-boost", manager: "BoostBoy", teamName: "Kickoff Kings", league: "2025-alpha", week: 3, locked: false, lastUpdated: "2025-11-16 4:20 PM" },
  { id: "11", fantasyTeamId: "test-2025-demo", manager: "DemoLord", teamName: "Bumper Cars", league: "2025-beta", week: 3, locked: true, lastUpdated: "2025-11-15 6:50 AM" },
  { id: "12", fantasyTeamId: "test-2025-save", manager: "SaveGod", teamName: "Wall Warriors", league: "2025-gamma", week: 3, locked: false, lastUpdated: "2025-11-16 5:00 PM" },
];

export default function LockLineupsPage() {
  const [currentWeek, setCurrentWeek] = useState(3);
  const [lineups, setLineups] = useState(mockLineupStatus);
  const [filterLeague, setFilterLeague] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<typeof mockLineupStatus[0] | null>(null);
  const [managerRoster, setManagerRoster] = useState<ReturnType<typeof generateMockRoster>>([]);

  const toggleLock = (id: string) => {
    setLineups((prev) =>
      prev.map((lineup) =>
        lineup.id === id
          ? {
              ...lineup,
              locked: !lineup.locked,
              lastUpdated: new Date().toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : lineup
      )
    );
  };

  const lockAll = () => {
    setLineups((prev) =>
      prev.map((lineup) => ({
        ...lineup,
        locked: true,
        lastUpdated: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))
    );
    setShowConfirmModal(false);
    alert("All lineups have been locked!");
  };

  const openRosterModal = (manager: typeof mockLineupStatus[0]) => {
    setSelectedManager(manager);
    setManagerRoster(generateMockRoster(manager.manager));
    setShowRosterModal(true);
  };

  const toggleTeamLock = (index: number) => {
    setManagerRoster(prev => prev.map((team, i) =>
      i === index ? { ...team, locked: !team.locked } : team
    ));
  };

  const lockWholeRoster = () => {
    setManagerRoster(prev => prev.map(team => ({ ...team, locked: true })));
  };

  const saveRosterLocks = () => {
    const allLocked = managerRoster.every(team => team.locked);
    setLineups(prev => prev.map(lineup =>
      lineup.id === selectedManager?.id
        ? { ...lineup, locked: allLocked, lastUpdated: new Date().toLocaleString("en-US") }
        : lineup
    ));
    setShowRosterModal(false);
    alert("Roster locks updated!");
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
                        {item.slot}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <Image
                            src={item.team.logoPath}
                            alt={item.team.name}
                            width={32}
                            height={32}
                            style={{ borderRadius: "4px" }}
                          />
                          <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                            {item.team.leagueId} {item.team.name}
                          </span>
                        </div>
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
                              width: item.locked ? "100%" : "0%",
                              height: "100%",
                              background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                              transition: "width 0.3s ease"
                            }} />
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            {item.locked ? "Locked" : "Unlocked"}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                        <button
                          className={item.locked ? "btn btn-ghost" : "btn btn-warning"}
                          style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                          onClick={() => toggleTeamLock(index)}
                        >
                          {item.locked ? "Unlock" : "Lock"}
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
              <option value="2025-alpha">2025 Alpha</option>
              <option value="2025-beta">2025 Beta</option>
              <option value="2025-gamma">2025 Gamma</option>
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
            {filteredLineups.map((lineup) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
