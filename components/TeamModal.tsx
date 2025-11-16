"use client";

import Image from "next/image";
import { useState } from "react";
import { getPlayersByTeamId, Player } from "@/lib/players";

interface TeamModalProps {
  team: {
    leagueId: string;
    name: string;
    logoPath: string;
    teamPrimaryColor: string;
    teamSecondaryColor: string;
    id: string;
    fpts?: number;
    avg?: number;
    last?: number;
    rank?: number;
    record?: string;
    status?: string;
    rosteredBy?: {
      rosterName: string;
      managerName: string;
    };
  } | null;
  onClose: () => void;
}

export default function TeamModal({ team, onClose }: TeamModalProps) {
  const [playerSortColumn, setPlayerSortColumn] = useState<string>("goals");
  const [playerSortDirection, setPlayerSortDirection] = useState<"asc" | "desc">("desc");
  const [weeklyStats] = useState([
    { week: 1, opponent: "AL Comets", fpts: 52, avg: 53, last: 48, goals: 8, shots: 142, saves: 89, assists: 12, demos: 18, record: "W" },
    { week: 2, opponent: "AL Dodgers", fpts: 48, avg: 52, last: 52, goals: 6, shots: 128, saves: 95, assists: 10, demos: 15, record: "L" },
    { week: 3, opponent: "AL Ducks", fpts: 55, avg: 52, last: 48, goals: 9, shots: 155, saves: 82, assists: 14, demos: 20, record: "W" },
  ]);
  const [weeklySortColumn, setWeeklySortColumn] = useState<string>("week");
  const [weeklySortDirection, setWeeklySortDirection] = useState<"asc" | "desc">("asc");

  if (!team) return null;

  const players = getPlayersByTeamId(team.id);

  const handlePlayerSort = (column: string) => {
    if (playerSortColumn === column) {
      setPlayerSortDirection(playerSortDirection === "asc" ? "desc" : "asc");
    } else {
      setPlayerSortColumn(column);
      setPlayerSortDirection("desc");
    }
  };

  const handleWeeklySort = (column: string) => {
    if (weeklySortColumn === column) {
      setWeeklySortDirection(weeklySortDirection === "asc" ? "desc" : "asc");
    } else {
      setWeeklySortColumn(column);
      setWeeklySortDirection(column === "week" ? "asc" : "desc");
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const aVal = a[playerSortColumn as keyof Player];
    const bVal = b[playerSortColumn as keyof Player];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return playerSortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const sortedWeeklyStats = [...weeklyStats].sort((a, b) => {
    const aVal = a[weeklySortColumn as keyof typeof weeklyStats[0]];
    const bVal = b[weeklySortColumn as keyof typeof weeklyStats[0]];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return weeklySortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const PlayerSortIcon = ({ column }: { column: string }) => {
    if (playerSortColumn !== column) return null;
    return <span style={{ marginLeft: "0.25rem", fontSize: "0.7rem" }}>{playerSortDirection === "asc" ? "▲" : "▼"}</span>;
  };

  const WeeklySortIcon = ({ column }: { column: string }) => {
    if (weeklySortColumn !== column) return null;
    return <span style={{ marginLeft: "0.25rem", fontSize: "0.7rem" }}>{weeklySortDirection === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          borderRadius: "12px",
          padding: "2rem",
          background: `linear-gradient(135deg, ${team.teamPrimaryColor} 0%, ${team.teamSecondaryColor} 100%)`,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Background Logo */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "400px",
            backgroundImage: `url(${team.logoPath})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            opacity: 0.1,
            pointerEvents: "none",
            zIndex: 0
          }}
        />

        {/* Modal Header */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "1.5rem",
          marginBottom: "2rem",
          paddingBottom: "1.5rem",
          borderBottom: "2px solid rgba(255,255,255,0.2)",
          position: "relative",
          zIndex: 1
        }}>
          <Image
            src={team.logoPath}
            alt={`${team.name} logo`}
            width={80}
            height={80}
            style={{ borderRadius: "8px" }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 0.5rem 0",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)"
            }}>
              {team.leagueId} {team.name}
            </h2>
            {team.record && (
              <div style={{
                fontSize: "1rem",
                color: "rgba(255,255,255,0.9)",
                marginBottom: "0.75rem"
              }}>
                {team.record} · {team.rank}{team.rank === 1 ? 'st' : team.rank === 2 ? 'nd' : team.rank === 3 ? 'rd' : 'th'}
              </div>
            )}
            {team.fpts && (
              <div style={{
                display: "flex",
                gap: "2rem",
                marginBottom: "0.75rem"
              }}>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
                    {team.fpts}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                    Fantasy Points
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
                    {team.avg}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                    Avg Fantasy Points
                  </div>
                </div>
              </div>
            )}
            {(team.status || team.rosteredBy) && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{
                  display: "inline-block",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  backdropFilter: "blur(4px)"
                }}>
                  {team.rosteredBy ? "Rostered" : team.status === "free-agent" ? "Free Agent" : "On Waivers"}
                </span>
                {team.rosteredBy && (
                  <span style={{
                    fontSize: "0.9rem",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: 600
                  }}>
                    | {team.rosteredBy.rosterName} ({team.rosteredBy.managerName})
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "#ffffff",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.25rem 0.5rem",
              lineHeight: 1,
              borderRadius: "4px",
              backdropFilter: "blur(4px)"
            }}
          >
            ×
          </button>
        </div>

        {/* Players Table */}
        <div style={{ position: "relative", zIndex: 1, marginBottom: "2rem" }}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#ffffff",
            marginBottom: "1rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}>
            Roster
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Player</th>
                  <th onClick={() => handlePlayerSort("goals")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Goals<PlayerSortIcon column="goals" /></th>
                  <th onClick={() => handlePlayerSort("shots")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Shots<PlayerSortIcon column="shots" /></th>
                  <th onClick={() => handlePlayerSort("saves")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Saves<PlayerSortIcon column="saves" /></th>
                  <th onClick={() => handlePlayerSort("assists")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Assists<PlayerSortIcon column="assists" /></th>
                  <th onClick={() => handlePlayerSort("demos")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Demos<PlayerSortIcon column="demos" /></th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Record</th>
                  <th onClick={() => handlePlayerSort("2sU")} style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>2sU<PlayerSortIcon column="2sU" /></th>
                  <th onClick={() => handlePlayerSort("3sU")} style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>3sU<PlayerSortIcon column="3sU" /></th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player) => (
                  <tr key={player.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#ffffff" }}>{player.name}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{player.goals}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{player.shots}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{player.saves}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{player.assists}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{player.demos}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>{player.record}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{player["2sU"]}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{player["3sU"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly Stats Table */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#ffffff",
            marginBottom: "1rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}>
            Weekly Breakdown
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                  <th onClick={() => handleWeeklySort("week")} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Week<WeeklySortIcon column="week" /></th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Opponent</th>
                  <th onClick={() => handleWeeklySort("fpts")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Fpts<WeeklySortIcon column="fpts" /></th>
                  <th onClick={() => handleWeeklySort("avg")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Avg<WeeklySortIcon column="avg" /></th>
                  <th onClick={() => handleWeeklySort("last")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Last<WeeklySortIcon column="last" /></th>
                  <th onClick={() => handleWeeklySort("goals")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Goals<WeeklySortIcon column="goals" /></th>
                  <th onClick={() => handleWeeklySort("shots")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Shots<WeeklySortIcon column="shots" /></th>
                  <th onClick={() => handleWeeklySort("saves")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Saves<WeeklySortIcon column="saves" /></th>
                  <th onClick={() => handleWeeklySort("assists")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Assists<WeeklySortIcon column="assists" /></th>
                  <th onClick={() => handleWeeklySort("demos")} style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>Demos<WeeklySortIcon column="demos" /></th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Record</th>
                </tr>
              </thead>
              <tbody>
                {sortedWeeklyStats.map((week) => (
                  <tr key={week.week} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#ffffff" }}>{week.week}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.opponent}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.9rem", color: "#ffffff" }}>{week.fpts}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>{week.avg}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>{week.last}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.goals}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.shots}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.saves}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.assists}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9rem", color: "rgba(255,255,255,0.95)" }}>{week.demos}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>{week.record}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
