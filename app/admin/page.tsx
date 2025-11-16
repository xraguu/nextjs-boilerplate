"use client";

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div>
      {/* Quick Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
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
            Total Leagues
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            3
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
            Active Managers
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            36
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
              color: "var(--accent)",
            }}
          >
            3
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
            Pending Waivers
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            12
          </div>
        </div>
      </div>

      {/* Admin Actions Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* League Management */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "var(--text-main)",
            }}
          >
            League Management
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Create new leagues, edit existing league settings, and manage league
            rosters.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={() => router.push("/admin/leagues")}
          >
            Manage Leagues
          </button>
        </div>

        {/* Week Controls */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "var(--text-main)",
            }}
          >
            Week Controls
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Lock lineups, process waivers, and advance to the next week.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}>
            <button
              className="btn btn-ghost"
              style={{ width: "100%" }}
              onClick={() => router.push("/admin/lock-lineups")}
            >
              Lock Lineups
            </button>
            <button
              className="btn btn-ghost"
              style={{ width: "100%" }}
              onClick={() => router.push("/admin/waivers")}
            >
              Process Waivers
            </button>
          </div>
        </div>

        {/* Stats Management */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "var(--text-main)",
            }}
          >
            Stats Management
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Recompute fantasy scores and update team statistics.
          </p>
          <button
            className="btn btn-ghost"
            style={{ width: "100%" }}
            onClick={() => router.push("/admin/stats")}
          >
            Recompute Stats
          </button>
        </div>

        {/* User Management */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "var(--text-main)",
            }}
          >
            User Management
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Manage user accounts, permissions, and admin roles.
          </p>
          <button
            className="btn btn-ghost"
            style={{ width: "100%" }}
            onClick={() => router.push("/admin/users")}
          >
            Manage Users
          </button>
        </div>

        {/* System Settings */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "var(--text-main)",
            }}
          >
            System Settings
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Configure global settings, scoring rules, and system parameters.
          </p>
          <button
            className="btn btn-ghost"
            style={{ width: "100%" }}
            onClick={() => router.push("/admin/settings")}
          >
            Settings
          </button>
        </div>

        {/* Database Tools */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "var(--text-main)",
            }}
          >
            Database Tools
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Database backup, restore, and maintenance operations.
          </p>
          <button
            className="btn btn-ghost"
            style={{ width: "100%" }}
            onClick={() => router.push("/admin/database")}
          >
            Database Tools
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="card"
        style={{ padding: "1.5rem", marginTop: "2rem" }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "var(--text-main)",
          }}
        >
          Recent Admin Activity
        </h2>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <p>Activity log will appear here...</p>
        </div>
      </div>
    </div>
  );
}
