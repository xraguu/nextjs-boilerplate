"use client";

import { useState } from "react";

// Mock users data
const mockUsersAdmin = [
  { id: "user-1", discordId: "123456789", displayName: "Nick", avatarUrl: null, role: "admin", fantasyTeamsCount: 3, createdAt: "2024-09-01", lastActive: "2025-11-16", status: "active" },
  { id: "user-2", discordId: "987654321", displayName: "Rover", avatarUrl: null, role: "commissioner", fantasyTeamsCount: 2, createdAt: "2024-09-05", lastActive: "2025-11-15", status: "active" },
  { id: "user-3", discordId: "555123456", displayName: "FlipReset", avatarUrl: null, role: "user", fantasyTeamsCount: 1, createdAt: "2024-09-10", lastActive: "2025-11-14", status: "active" },
  { id: "user-4", discordId: "444987654", displayName: "AirDribbler", avatarUrl: null, role: "user", fantasyTeamsCount: 2, createdAt: "2024-09-12", lastActive: "2025-11-13", status: "active" },
  { id: "user-5", discordId: "333555777", displayName: "SpeedDemon", avatarUrl: null, role: "user", fantasyTeamsCount: 1, createdAt: "2024-09-15", lastActive: "2025-11-12", status: "active" },
  { id: "user-6", discordId: "222444666", displayName: "MustyCrew", avatarUrl: null, role: "user", fantasyTeamsCount: 1, createdAt: "2024-09-18", lastActive: "2025-11-11", status: "active" },
  { id: "user-7", discordId: "111222333", displayName: "CeilingShotz", avatarUrl: null, role: "commissioner", fantasyTeamsCount: 2, createdAt: "2024-09-20", lastActive: "2025-11-10", status: "active" },
  { id: "user-8", discordId: "999888777", displayName: "WaveDash", avatarUrl: null, role: "user", fantasyTeamsCount: 1, createdAt: "2024-09-22", lastActive: "2025-11-09", status: "active" },
  { id: "user-9", discordId: "888777666", displayName: "FlipMaster", avatarUrl: null, role: "user", fantasyTeamsCount: 1, createdAt: "2024-09-25", lastActive: "2025-11-08", status: "active" },
  { id: "user-10", discordId: "777666555", displayName: "BoostBoy", avatarUrl: null, role: "user", fantasyTeamsCount: 2, createdAt: "2024-09-28", lastActive: "2025-11-07", status: "active" },
  { id: "user-11", discordId: "666555444", displayName: "DemoLord", avatarUrl: null, role: "user", fantasyTeamsCount: 1, createdAt: "2024-10-01", lastActive: "2025-11-06", status: "active" },
  { id: "user-12", discordId: "555444333", displayName: "SaveGod", avatarUrl: null, role: "user", fantasyTeamsCount: 1, createdAt: "2024-10-05", lastActive: "2025-11-05", status: "suspended" },
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState(mockUsersAdmin);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsersAdmin[0] | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.discordId.includes(searchTerm);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const updateUserRole = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole as any } : user
      )
    );
    setShowEditModal(false);
    alert("User role updated successfully!");
  };

  const suspendUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "suspended" as const } : user
      )
    );
    alert("User has been suspended!");
  };

  const activateUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "active" as const } : user
      )
    );
    alert("User has been activated!");
  };

  const roleStats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    commissioners: users.filter((u) => u.role === "commissioner").length,
    users: users.filter((u) => u.role === "user").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  return (
    <div>
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowEditModal(false)}
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
                Edit User: {selectedUser.displayName}
              </h2>
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Discord ID: {selectedUser.discordId}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Fantasy Teams: {selectedUser.fantasyTeamsCount}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Member Since: {selectedUser.createdAt}
                </div>
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Role
                </label>
                <select
                  defaultValue={selectedUser.role}
                  onChange={(e) =>
                    updateUserRole(selectedUser.id, e.target.value)
                  }
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
                  <option value="user">User</option>
                  <option value="commissioner">Commissioner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                {selectedUser.status === "active" ? (
                  <button
                    className="btn btn-warning"
                    style={{ flex: 1 }}
                    onClick={() => {
                      suspendUser(selectedUser.id);
                      setShowEditModal(false);
                    }}
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      activateUser(selectedUser.id);
                      setShowEditModal(false);
                    }}
                  >
                    Activate User
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

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
            Total Users
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {roleStats.total}
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
            Admins
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#ef4444",
            }}
          >
            {roleStats.admins}
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
            Commissioners
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#f59e0b",
            }}
          >
            {roleStats.commissioners}
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
            Regular Users
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#22c55e",
            }}
          >
            {roleStats.users}
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
            Suspended
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#9ca3af",
            }}
          >
            {roleStats.suspended}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          gap: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="Search by name or Discord ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "6px",
            color: "var(--text-main)",
            fontSize: "0.95rem",
          }}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
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
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="commissioner">Commissioners</option>
          <option value="user">Users</option>
        </select>
      </div>

      {/* Users Table */}
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
                Display Name
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
                Discord ID
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
                Role
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
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Last Active
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
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                  {user.displayName}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  {user.discordId}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      background:
                        user.role === "admin"
                          ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                          : user.role === "commissioner"
                          ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                          : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      color: "white",
                    }}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {user.fantasyTeamsCount}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {user.lastActive}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      background:
                        user.status === "active"
                          ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                          : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                      color: "white",
                    }}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "right",
                  }}
                >
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
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
