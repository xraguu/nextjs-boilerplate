"use client";

import { useState } from "react";
import { LEAGUES } from "@/lib/leagues";

// Mock computation log data
const mockComputationLog = [
  { id: 1, timestamp: "2025-11-16 10:00 AM", action: "Recomputed all stats for Week 3", status: "success", teamsProcessed: 144, playersProcessed: 432, duration: "2.3s", errors: 0 },
  { id: 2, timestamp: "2025-11-15 10:00 AM", action: "Recomputed all stats for Week 2", status: "success", teamsProcessed: 144, playersProcessed: 432, duration: "2.1s", errors: 0 },
  { id: 3, timestamp: "2025-11-14 10:00 AM", action: "Recomputed PL stats for Week 1", status: "success", teamsProcessed: 16, playersProcessed: 48, duration: "0.5s", errors: 0 },
  { id: 4, timestamp: "2025-11-13 10:00 AM", action: "Recomputed all stats for Week 1", status: "failed", teamsProcessed: 89, playersProcessed: 267, duration: "8.7s", errors: 1, errorMsg: "API timeout" },
  { id: 5, timestamp: "2025-11-12 10:00 AM", action: "Recomputed ML stats for Week 3", status: "success", teamsProcessed: 32, playersProcessed: 96, duration: "1.1s", errors: 0 },
];

export default function RecomputeStatsPage() {
  const [scope, setScope] = useState("all");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("3");
  const [isComputing, setIsComputing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState(mockComputationLog);

  const startComputation = () => {
    setIsComputing(true);
    setProgress(0);

    // Simulate computation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComputing(false);

          // Add new log entry
          const newLog = {
            id: logs.length + 1,
            timestamp: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            action: scope === "all"
              ? `Recomputed all stats for Week ${selectedWeek}`
              : `Recomputed ${selectedLeague} stats for Week ${selectedWeek}`,
            status: "success",
            teamsProcessed: scope === "all" ? 144 : 32,
            playersProcessed: scope === "all" ? 432 : 96,
            duration: `${(1.5 + (scope === "all" ? 1 : 0)).toFixed(1)}s`,
            errors: 0,
          };
          setLogs([newLog, ...logs]);
          alert("Stats recomputation completed successfully!");

          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div>
      {/* Control Panel */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "2rem",
            color: "var(--accent)",
          }}
        >
          Computation Settings
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Scope Selector */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Scope
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              disabled={isComputing}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              <option value="all">All Leagues</option>
              <option value="specific">Specific League</option>
            </select>
          </div>

          {/* League Selector */}
          {scope === "specific" && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Select League
              </label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                disabled={isComputing}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "var(--text-main)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                {LEAGUES.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Week Selector */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              disabled={isComputing}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                fontWeight: 600,
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

        {/* Compute Button */}
        <button
          className="btn btn-warning"
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.1rem",
            fontWeight: 700,
          }}
          onClick={startComputation}
          disabled={isComputing}
        >
          {isComputing ? "Computing..." : "Recompute Stats"}
        </button>

        {/* Progress Bar */}
        {isComputing && (
          <div style={{ marginTop: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Computing...
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent)" }}>
                {progress}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "12px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, var(--mle-gold), #ffd700)",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Last Successful Computation Info */}
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
            Last Computation
          </div>
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-main)",
            }}
          >
            {logs[0]?.timestamp || "Never"}
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
            Teams Processed
          </div>
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {logs[0]?.teamsProcessed || 0}
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
            Players Processed
          </div>
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {logs[0]?.playersProcessed || 0}
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
            Duration
          </div>
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {logs[0]?.duration || "0s"}
          </div>
        </div>
      </div>

      {/* Computation History */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--text-main)",
          }}
        >
          Computation History
        </h2>
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
                Timestamp
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
                Action
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
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Teams
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
                Players
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
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {log.timestamp}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                  {log.action}
                  {log.errorMsg && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#ef4444",
                        marginTop: "0.25rem",
                      }}
                    >
                      Error: {log.errorMsg}
                    </div>
                  )}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      background:
                        log.status === "success"
                          ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                          : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      color: "white",
                    }}
                  >
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {log.teamsProcessed}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {log.playersProcessed}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  {log.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
