"use client";

import { useState } from "react";

// Mock backup history
const mockBackupHistory = [
  { id: "backup-1", timestamp: "2025-11-16 00:00:00", size: "2.4 MB", status: "success", filename: "backup-2025-11-16.sql" },
  { id: "backup-2", timestamp: "2025-11-15 00:00:00", size: "2.3 MB", status: "success", filename: "backup-2025-11-15.sql" },
  { id: "backup-3", timestamp: "2025-11-14 00:00:00", size: "2.2 MB", status: "success", filename: "backup-2025-11-14.sql" },
  { id: "backup-4", timestamp: "2025-11-13 00:00:00", size: "0 MB", status: "failed", filename: null, error: "Disk full" },
  { id: "backup-5", timestamp: "2025-11-12 00:00:00", size: "2.1 MB", status: "success", filename: "backup-2025-11-12.sql" },
];

// Mock database stats
const mockDatabaseStats = {
  status: "connected",
  size: "12.8 MB",
  tables: {
    users: 156,
    fantasyLeagues: 8,
    fantasyTeams: 96,
    teams: 144,
    players: 432,
    rosters: 768,
    waivers: 234,
  },
  lastBackup: "2025-11-16 00:00:00",
};

export default function DatabaseToolsPage() {
  const [backups, setBackups] = useState(mockBackupHistory);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const createBackup = () => {
    setIsCreatingBackup(true);
    setTimeout(() => {
      const newBackup = {
        id: `backup-${backups.length + 1}`,
        timestamp: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        size: "2.5 MB",
        status: "success" as const,
        filename: `backup-${new Date().toISOString().split("T")[0]}.sql`,
      };
      setBackups([newBackup, ...backups]);
      setIsCreatingBackup(false);
      alert("Backup created successfully!");
    }, 2000);
  };

  const downloadBackup = (filename: string) => {
    alert(`Downloading ${filename}...`);
  };

  const restoreBackup = (filename: string) => {
    if (
      confirm(
        `Are you sure you want to restore from ${filename}? This will overwrite all current data!`
      )
    ) {
      alert("Database restored successfully!");
    }
  };

  const optimizeDatabase = () => {
    if (confirm("Optimize database? This may take a few minutes.")) {
      alert("Database optimized successfully!");
    }
  };

  const clearCache = () => {
    if (confirm("Clear all cached data?")) {
      alert("Cache cleared successfully!");
    }
  };

  const resetTestData = () => {
    if (
      confirm(
        "WARNING: This will delete all data and reset to test data. Are you absolutely sure?"
      )
    ) {
      if (
        confirm(
          "This action cannot be undone! Type 'RESET' in the next prompt to confirm."
        )
      ) {
        const confirmation = prompt("Type RESET to confirm:");
        if (confirmation === "RESET") {
          alert("Test data reset successfully!");
        }
      }
    }
  };

  return (
    <div>
      {/* Database Status */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--accent)",
          }}
        >
          Database Status
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              Connection Status
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background:
                    mockDatabaseStats.status === "connected"
                      ? "#22c55e"
                      : "#ef4444",
                }}
              />
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                }}
              >
                {mockDatabaseStats.status.charAt(0).toUpperCase() +
                  mockDatabaseStats.status.slice(1)}
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              Database Size
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {mockDatabaseStats.size}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              Total Records
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {Object.values(mockDatabaseStats.tables).reduce((a, b) => a + b, 0)}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              Last Backup
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "var(--text-main)",
              }}
            >
              {mockDatabaseStats.lastBackup}
            </div>
          </div>
        </div>

        {/* Table Counts */}
        <div style={{ marginTop: "2rem" }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "var(--text-main)",
            }}
          >
            Records by Table
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            {Object.entries(mockDatabaseStats.tables).map(([table, count]) => (
              <div
                key={table}
                style={{
                  padding: "1rem",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {table}
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backup Operations */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--accent)",
          }}
        >
          Backup Operations
        </h2>
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
            onClick={createBackup}
            disabled={isCreatingBackup}
          >
            {isCreatingBackup ? "Creating Backup..." : "Create Backup Now"}
          </button>
        </div>

        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "var(--text-main)",
          }}
        >
          Backup History
        </h3>
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
                Filename
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
                Size
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
            {backups.map((backup) => (
              <tr
                key={backup.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {backup.timestamp}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                  {backup.filename || "-"}
                  {backup.error && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#ef4444",
                        marginTop: "0.25rem",
                      }}
                    >
                      Error: {backup.error}
                    </div>
                  )}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {backup.size}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      background:
                        backup.status === "success"
                          ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                          : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      color: "white",
                    }}
                  >
                    {backup.status.charAt(0).toUpperCase() + backup.status.slice(1)}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "right",
                  }}
                >
                  {backup.filename && (
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                        onClick={() => downloadBackup(backup.filename!)}
                      >
                        Download
                      </button>
                      <button
                        className="btn btn-warning"
                        style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                        onClick={() => restoreBackup(backup.filename!)}
                      >
                        Restore
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Maintenance Operations */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--accent)",
          }}
        >
          Maintenance Operations
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <button
            className="btn btn-ghost"
            style={{ padding: "1rem", fontSize: "1rem" }}
            onClick={optimizeDatabase}
          >
            Optimize Database
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: "1rem", fontSize: "1rem" }}
            onClick={clearCache}
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Import/Export */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--accent)",
          }}
        >
          Import / Export
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <button
            className="btn btn-primary"
            style={{ padding: "1rem", fontSize: "1rem" }}
            onClick={() => alert("Exporting all data as JSON...")}
          >
            Export All Data (JSON)
          </button>
          <div>
            <label
              className="btn btn-ghost"
              style={{
                padding: "1rem",
                fontSize: "1rem",
                width: "100%",
                display: "block",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              Import Data
              <input
                type="file"
                accept=".json,.sql"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    alert(`Importing ${e.target.files[0].name}...`);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="card"
        style={{
          padding: "2rem",
          border: "2px solid #ef4444",
          background: "rgba(239, 68, 68, 0.05)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "#ef4444",
          }}
        >
          Danger Zone
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
            lineHeight: 1.6,
          }}
        >
          These operations are destructive and cannot be undone. Use with extreme
          caution!
        </p>
        <button
          className="btn btn-warning"
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1rem",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          }}
          onClick={resetTestData}
        >
          Reset to Test Data
        </button>
      </div>
    </div>
  );
}
