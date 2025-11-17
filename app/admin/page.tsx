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
            Pending Transactions
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            19
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
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
