"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Mock data for 12 managers
const mockManagers = [
  { id: 1, name: "xenn", teamName: "Fantastic Ballers" },
  { id: 2, name: "Crazy Rover", teamName: "Crazy Rovers" },
  { id: 3, name: "Manager 3", teamName: "Pixies" },
  { id: 4, name: "Manager 4", teamName: "Whiffers" },
  { id: 5, name: "Manager 5", teamName: "Thunder" },
  { id: 6, name: "Manager 6", teamName: "Blazers" },
  { id: 7, name: "Manager 7", teamName: "Storm" },
  { id: 8, name: "Manager 8", teamName: "Lightning" },
  { id: 9, name: "Manager 9", teamName: "Phoenix" },
  { id: 10, name: "Manager 10", teamName: "Eclipse" },
  { id: 11, name: "Manager 11", teamName: "Vortex" },
  { id: 12, name: "Manager 12", teamName: "Flames" },
];

// Mock schedule data for each manager
const mockSchedule = {
  1: [
    { week: 1, result: "W", myScore: 198, oppScore: 170, opponent: "Pixies", oppRecord: "2-1", oppPlace: "3rd", manager: "Crazy" },
    { week: 2, result: "L", myScore: 131, oppScore: 168, opponent: "Whiffers", oppRecord: "0-3", oppPlace: "8th", manager: "Rover" },
    { week: 3, result: null, myScore: null, oppScore: null, opponent: "Thunder", oppRecord: "1-2", oppPlace: "5th", manager: "Mike" },
    { week: 4, result: null, myScore: null, oppScore: null, opponent: "Blazers", oppRecord: "2-1", oppPlace: "2nd", manager: "Sarah" },
    { week: 5, result: null, myScore: null, oppScore: null, opponent: "Storm", oppRecord: "1-2", oppPlace: "6th", manager: "John" },
    { week: 6, result: null, myScore: null, oppScore: null, opponent: "Lightning", oppRecord: "3-0", oppPlace: "1st", manager: "Emma" },
    { week: 7, result: null, myScore: null, oppScore: null, opponent: "Phoenix", oppRecord: "0-3", oppPlace: "9th", manager: "Alex" },
    { week: 8, result: null, myScore: null, oppScore: null, opponent: "Eclipse", oppRecord: "2-1", oppPlace: "4th", manager: "Chris" },
    { week: 9, result: null, myScore: null, oppScore: null, opponent: "Vortex", oppRecord: "1-2", oppPlace: "7th", manager: "Jordan" },
    { week: 10, result: null, myScore: null, oppScore: null, opponent: "Flames", oppRecord: "2-1", oppPlace: "3rd", manager: "Taylor" },
  ],
  2: [
    { week: 1, result: "L", myScore: 170, oppScore: 198, opponent: "Fantastic Ballers", oppRecord: "2-1", oppPlace: "3rd", manager: "xenn" },
    { week: 2, result: "W", myScore: 168, oppScore: 131, opponent: "Pixies", oppRecord: "0-3", oppPlace: "8th", manager: "Manager 3" },
    { week: 3, result: null, myScore: null, oppScore: null, opponent: "Whiffers", oppRecord: "1-2", oppPlace: "5th", manager: "Manager 4" },
    { week: 4, result: null, myScore: null, oppScore: null, opponent: "Thunder", oppRecord: "2-1", oppPlace: "2nd", manager: "Manager 5" },
    { week: 5, result: null, myScore: null, oppScore: null, opponent: "Blazers", oppRecord: "1-2", oppPlace: "6th", manager: "Manager 6" },
    { week: 6, result: null, myScore: null, oppScore: null, opponent: "Storm", oppRecord: "3-0", oppPlace: "1st", manager: "Manager 7" },
    { week: 7, result: null, myScore: null, oppScore: null, opponent: "Lightning", oppRecord: "0-3", oppPlace: "9th", manager: "Manager 8" },
    { week: 8, result: null, myScore: null, oppScore: null, opponent: "Phoenix", oppRecord: "2-1", oppPlace: "4th", manager: "Manager 9" },
    { week: 9, result: null, myScore: null, oppScore: null, opponent: "Eclipse", oppRecord: "1-2", oppPlace: "7th", manager: "Manager 10" },
    { week: 10, result: null, myScore: null, oppScore: null, opponent: "Vortex", oppRecord: "2-1", oppPlace: "3rd", manager: "Manager 11" },
  ],
};

// Generate schedule for remaining managers (simplified for demo)
for (let i = 3; i <= 12; i++) {
  mockSchedule[i] = Array.from({ length: 10 }, (_, weekIndex) => ({
    week: weekIndex + 1,
    result: weekIndex < 2 ? (Math.random() > 0.5 ? "W" : "L") : null,
    myScore: weekIndex < 2 ? Math.floor(Math.random() * 50) + 150 : null,
    oppScore: weekIndex < 2 ? Math.floor(Math.random() * 50) + 150 : null,
    opponent: mockManagers[Math.floor(Math.random() * 12)].teamName,
    oppRecord: `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3)}`,
    oppPlace: `${Math.floor(Math.random() * 9) + 1}th`,
    manager: mockManagers[Math.floor(Math.random() * 12)].name,
  }));
}

export default function SchedulePage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.LeagueID as string;

  const [activeManager, setActiveManager] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const schedule = mockSchedule[activeManager] || [];

  // Helper functions for week navigation (weeks 1-10)
  const getNextWeek = (week: number) => {
    if (week >= 10) return 10;
    return week + 1;
  };

  const getPrevWeek = (week: number) => {
    if (week <= 1) return 1;
    return week - 1;
  };

  const handleManagerClick = (managerName: string) => {
    router.push(`/leagues/${leagueId}/opponents?manager=${encodeURIComponent(managerName)}`);
  };

  return (
    <>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => router.push(`/leagues/${leagueId}/my-roster/${params.managerId}`)}
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "var(--text-main)",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
            }}
          >
            ← Back to My Roster
          </button>
          <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>
            Schedule
          </h1>
        </div>
      </div>

      {/* Manager Tabs */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "2rem",
        overflowX: "auto",
        paddingBottom: "0.5rem"
      }}>
        {mockManagers.map((manager) => (
          <button
            key={manager.id}
            onClick={() => setActiveManager(manager.id)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              backgroundColor: activeManager === manager.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
              color: activeManager === manager.id ? "var(--text-main)" : "var(--text-muted)",
              transition: "all 0.2s"
            }}
          >
            Manager {manager.id}
          </button>
        ))}
      </div>

      {/* Schedule Table */}
      <section className="card">
        {/* Week Navigation */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setCurrentWeek(prev => getPrevWeek(prev))}
              disabled={currentWeek === 1}
              className="btn btn-ghost"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
            >
              ◄ Week {getPrevWeek(currentWeek)}
            </button>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
              Week {currentWeek}
            </span>
            <button
              onClick={() => setCurrentWeek(prev => getNextWeek(prev))}
              disabled={currentWeek === 10}
              className="btn btn-ghost"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
            >
              Week {getNextWeek(currentWeek)} ►
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                <th style={{
                  padding: "1rem 1.5rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  color: "var(--text-main)",
                  fontWeight: 700,
                  width: "10%"
                }}>

                </th>
                <th style={{
                  padding: "1rem 1.5rem",
                  textAlign: "center",
                  fontSize: "1rem",
                  color: "var(--text-main)",
                  fontWeight: 700,
                  width: "25%"
                }}>
                  Score
                </th>
                <th style={{
                  padding: "1rem 1.5rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  color: "var(--text-main)",
                  fontWeight: 700,
                  width: "40%"
                }}>
                  Opponent
                </th>
                <th style={{
                  padding: "1rem 1.5rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  color: "var(--text-main)",
                  fontWeight: 700,
                  width: "25%"
                }}>
                  Manager
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.filter(game => game.week === currentWeek).map((game, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  {/* Week */}
                  <td style={{
                    padding: "1.25rem 1.5rem",
                    fontSize: "1rem",
                    color: "var(--text-muted)",
                    fontWeight: 500
                  }}>
                    Week {game.week}
                  </td>

                  {/* Score */}
                  <td style={{
                    padding: "1.25rem 1.5rem",
                    textAlign: "center"
                  }}>
                    {game.result ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: game.result === "W" ? "#4ade80" : "#ef4444"
                        }}>
                          {game.result}
                        </span>
                        <span style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text-main)"
                        }}>
                          {game.myScore} - {game.oppScore}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>-</span>
                    )}
                  </td>

                  {/* Opponent */}
                  <td style={{
                    padding: "1.25rem 1.5rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{
                        fontSize: "1rem",
                        color: "var(--text-main)",
                        fontWeight: 500
                      }}>
                        vs. {game.opponent}
                      </span>
                      <span style={{
                        fontSize: "0.9rem",
                        color: "var(--text-muted)"
                      }}>
                        {game.oppRecord}
                      </span>
                      <span style={{
                        fontSize: "0.9rem",
                        color: "var(--text-muted)"
                      }}>
                        {game.oppPlace}
                      </span>
                    </div>
                  </td>

                  {/* Manager */}
                  <td style={{
                    padding: "1.25rem 1.5rem",
                    fontSize: "1rem",
                    color: "var(--text-main)",
                    fontWeight: 500
                  }}>
                    <span
                      onClick={() => handleManagerClick(game.manager)}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                      style={{
                        cursor: "pointer",
                        transition: "color 0.2s"
                      }}
                    >
                      {game.manager}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
