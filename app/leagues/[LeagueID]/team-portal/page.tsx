"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { TEAMS, LEAGUE_COLORS } from "@/lib/teams";
import TeamModal from "@/components/TeamModal";

// Mock team stats and availability
const mockTeamData = TEAMS.map((team, index) => ({
  ...team,
  rank: index + 1,
  fpts: Math.floor(Math.random() * 200 + 300), // Random points between 300-500
  avg: Math.floor(Math.random() * 20 + 35), // Random avg between 35-55
  last: Math.floor(Math.random() * 25 + 30), // Random last between 30-55
  goals: Math.floor(Math.random() * 50 + 100),
  shots: Math.floor(Math.random() * 200 + 600),
  saves: Math.floor(Math.random() * 100 + 150),
  assists: Math.floor(Math.random() * 40 + 60),
  demos: Math.floor(Math.random() * 30 + 30),
  record: `${Math.floor(Math.random() * 6 + 4)}-${Math.floor(Math.random() * 6 + 4)}`,
  status: Math.random() > 0.7 ? "waiver" : "free-agent", // 30% on waivers, 70% free agents
}));

type SortColumn = "fpts" | "avg" | "last" | "goals" | "shots" | "saves" | "assists" | "demos";
type SortDirection = "asc" | "desc";

export default function TeamPortalPage() {
  const [sortColumn, setSortColumn] = useState<SortColumn>("fpts");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTeam, setSelectedTeam] = useState<typeof mockTeamData[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to descending
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const sortedData = useMemo(() => {
    return [...mockTeamData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [sortColumn, sortDirection]);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return (
      <span style={{ marginLeft: "0.25rem" }}>
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <>
      {/* Team Stats Modal */}
      <TeamModal team={showModal ? selectedTeam : null} onClose={() => setShowModal(false)} />

      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>
          Teams
        </h1>
      </div>

      {/* Teams Table */}
      <section className="card">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                <th
                  onClick={() => handleSort("rank")}
                  style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Rank<SortIcon column="rank" />
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                <th
                  onClick={() => handleSort("fpts")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Fpts<SortIcon column="fpts" />
                </th>
                <th
                  onClick={() => handleSort("avg")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Avg<SortIcon column="avg" />
                </th>
                <th
                  onClick={() => handleSort("last")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Last<SortIcon column="last" />
                </th>
                <th
                  onClick={() => handleSort("goals")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Goals<SortIcon column="goals" />
                </th>
                <th
                  onClick={() => handleSort("shots")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Shots<SortIcon column="shots" />
                </th>
                <th
                  onClick={() => handleSort("saves")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Saves<SortIcon column="saves" />
                </th>
                <th
                  onClick={() => handleSort("assists")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Assists<SortIcon column="assists" />
                </th>
                <th
                  onClick={() => handleSort("demos")}
                  style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  Demos<SortIcon column="demos" />
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((team, index) => (
                <tr
                  key={team.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Image
                        src={team.logoPath}
                        alt={`${team.name} logo`}
                        width={32}
                        height={32}
                        style={{ borderRadius: "4px" }}
                      />
                      <div>
                        <div
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowModal(true);
                          }}
                          style={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            color: "var(--text-main)",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-main)"}
                        >
                          {team.leagueId} {team.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.95rem" }}>
                    {team.fpts}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {team.avg}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {team.last}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                    {team.goals}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                    {team.shots}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                    {team.saves}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                    {team.assists}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem" }}>
                    {team.demos}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {team.record}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    {team.status === "free-agent" ? (
                      <button
                        className="btn btn-warning"
                        style={{
                          fontSize: "0.85rem",
                          padding: "0.4rem 0.9rem"
                        }}
                      >
                        + Add
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost"
                        style={{
                          fontSize: "0.85rem",
                          padding: "0.4rem 0.9rem"
                        }}
                      >
                        Claim
                      </button>
                    )}
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
