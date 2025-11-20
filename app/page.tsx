"use client";
//hi
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";
import TeamModal from "@/components/TeamModal";

// Mock data - replace with actual API calls when ready
const mockLeagues = [
  {
    id: "2025-gamma",
    name: "2025 RL Fantasy Alpha",
    season: 2025,
    currentWeek: 3,
    yourTeam: "Nick's Bumps",
    record: { wins: 2, losses: 1 },
    rank: 3,
    totalPoints: 425.5,
    lastMatchup: {
      opponent: "Rover's Rotators",
      score: "152.5 - 148.0",
      result: "W",
    },
  },
  {
    id: "2025-beta",
    name: "2025 RL Fantasy Beta",
    season: 2025,
    currentWeek: 3,
    yourTeam: "Air Dribble Demons",
    record: { wins: 1, losses: 2 },
    rank: 8,
    totalPoints: 380.0,
    lastMatchup: {
      opponent: "Flip Reset Kings",
      score: "135.0 - 145.5",
      result: "L",
    },
  },
  {
    id: "2024-championship",
    name: "2024 Championship League",
    season: 2024,
    currentWeek: 8,
    yourTeam: "Ceiling Shot Squad",
    record: { wins: 5, losses: 3 },
    rank: 4,
    totalPoints: 1150.0,
    lastMatchup: {
      opponent: "Musty Flick Masters",
      score: "165.5 - 152.0",
      result: "W",
    },
  },
];

// Mock global leaderboard - top performers across all leagues
const mockGlobalLeaderboard = [
  {
    rank: 1,
    manager: "FlipReset",
    team: "Ceiling Shot Squad",
    league: "2025 Alpha",
    wins: 7,
    losses: 1,
    winRate: 87.5,
    totalPoints: 1250.5,
    avgPoints: 156.3,
    isYou: false,
  },
  {
    rank: 2,
    manager: "AirDribbler",
    team: "Musty Flick Masters",
    league: "2025 Beta",
    wins: 6,
    losses: 2,
    winRate: 75.0,
    totalPoints: 1180.0,
    avgPoints: 147.5,
    isYou: false,
  },
  {
    rank: 3,
    manager: "Nick",
    team: "Nick's Bumps",
    league: "2025 Alpha",
    wins: 5,
    losses: 3,
    winRate: 62.5,
    totalPoints: 1150.0,
    avgPoints: 143.8,
    isYou: true,
  },
  {
    rank: 4,
    manager: "SpeedDemon",
    team: "Boost Stealers",
    league: "2024 Championship",
    wins: 5,
    losses: 3,
    winRate: 62.5,
    totalPoints: 1120.5,
    avgPoints: 140.1,
    isYou: false,
  },
  {
    rank: 5,
    manager: "Kuxir",
    team: "Pinch Masters",
    league: "2025 Alpha",
    wins: 4,
    losses: 4,
    winRate: 50.0,
    totalPoints: 1050.0,
    avgPoints: 131.3,
    isYou: false,
  },
  {
    rank: 6,
    manager: "Squishy",
    team: "Double Tap Dynasty",
    league: "2025 Beta",
    wins: 4,
    losses: 4,
    winRate: 50.0,
    totalPoints: 1020.0,
    avgPoints: 127.5,
    isYou: false,
  },
  {
    rank: 7,
    manager: "Jstn",
    team: "Zero Second Goals",
    league: "2024 Championship",
    wins: 3,
    losses: 5,
    winRate: 37.5,
    totalPoints: 980.5,
    avgPoints: 122.6,
    isYou: false,
  },
  {
    rank: 8,
    manager: "Rover",
    team: "Air Dribble Demons",
    league: "2025 Beta",
    wins: 3,
    losses: 5,
    winRate: 37.5,
    totalPoints: 950.0,
    avgPoints: 118.8,
    isYou: false,
  },
  {
    rank: 9,
    manager: "Garrett",
    team: "Flip Reset Kings",
    league: "2025 Alpha",
    wins: 2,
    losses: 6,
    winRate: 25.0,
    totalPoints: 890.0,
    avgPoints: 111.3,
    isYou: false,
  },
  {
    rank: 10,
    manager: "Turbo",
    team: "Demo Destroyers",
    league: "2024 Championship",
    wins: 1,
    losses: 7,
    winRate: 12.5,
    totalPoints: 820.5,
    avgPoints: 102.6,
    isYou: false,
  },
];

// Top performing teams - using actual MLE teams
// Static values to prevent hydration errors (no Math.random())
const mockTopTeams = TEAMS.slice(0, 10).map((team, index) => ({
  ...team,
  rank: index + 1,
  tier:
    team.leagueId === "PL"
      ? "Premier"
      : team.leagueId === "ML"
      ? "Master"
      : team.leagueId === "CL"
      ? "Champion"
      : team.leagueId === "AL"
      ? "Academy"
      : "Foundation",
  division: team.leagueId,
  weekPoints: 42.5 - index * 0.5,
  totalPoints: 385.5 - index * 8.5,
  wins: 7 - Math.floor(index / 2),
  losses: 1 + Math.floor(index / 3),
  gameScore: 18 - index,
  ppg: 48.1 - index * 1.2,
  score: 50 - index * 2,
  fpts: 380 - index * 8,
  avg: 50 - index * 1.5,
  last: 48 - index * 1.8,
  goals: 140 - index * 4,
  shots: 750 - index * 15,
  saves: 220 - index * 7,
  assists: 95 - index * 3.5,
  demos: 55 - index * 2.5,
  record: `${7 - Math.floor(index / 2)}-${1 + Math.floor(index / 2)}`,
  status: "free-agent" as const,
}));

type SortKey =
  | "rank"
  | "name"
  | "score"
  | "fpts"
  | "last"
  | "avg"
  | "shots"
  | "goals"
  | "assists"
  | "saves"
  | "demos";
type SortDirection = "asc" | "desc";

// Sortable Header Component
function SortableHeader({
  column,
  label,
  align = "left",
  sortKey,
  sortDirection,
  onSort,
}: {
  column: SortKey;
  label: string;
  align?: "left" | "right" | "center";
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (column: SortKey) => void;
}) {
  return (
    <th
      onClick={() => onSort(column)}
      style={{
        padding: "0.75rem 0.5rem",
        textAlign: align,
        fontSize: "0.85rem",
        color: sortKey === column ? "var(--accent)" : "var(--text-muted)",
        fontWeight: 600,
        cursor: "pointer",
        userSelect: "none",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color =
          sortKey === column ? "var(--accent)" : "var(--text-muted)")
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            align === "right"
              ? "flex-end"
              : align === "center"
              ? "center"
              : "flex-start",
          gap: "0.25rem",
        }}
      >
        {label}
        {sortKey === column && (
          <span style={{ fontSize: "0.75rem" }}>
            {sortDirection === "asc" ? "▲" : "▼"}
          </span>
        )}
      </div>
    </th>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isAdmin, setIsAdmin] = useState(false);
  const [topTeams, setTopTeams] = useState<any[]>(mockTopTeams);
  const [loading, setLoading] = useState(true);

  // Fetch top teams from API
  useEffect(() => {
    const fetchTopTeams = async () => {
      try {
        const response = await fetch(`/api/teams/top`);
        if (response.ok) {
          const data = await response.json();
          setTopTeams(data.teams);
        } else {
          console.warn("Failed to fetch top teams, using mock data");
        }
      } catch (error) {
        console.error("Error fetching top teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTeams();
  }, []);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/user/role`);
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.role === "admin");
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };

    checkAdmin();
  }, [session]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedTeams = [...topTeams].sort((a, b) => {
    let aValue: number | string = 0;
    let bValue: number | string = 0;

    switch (sortKey) {
      case "rank":
        aValue = a.rank ?? 0;
        bValue = b.rank ?? 0;
        break;
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "score":
        aValue = a.score ?? 0;
        bValue = b.score ?? 0;
        break;
      case "fpts":
        aValue = a.fpts ?? 0;
        bValue = b.fpts ?? 0;
        break;
      case "last":
        aValue = a.last ?? 0;
        bValue = b.last ?? 0;
        break;
      case "avg":
        aValue = a.avg ?? 0;
        bValue = b.avg ?? 0;
        break;
      case "shots":
        aValue = a.shots ?? 0;
        bValue = b.shots ?? 0;
        break;
      case "goals":
        aValue = a.goals ?? 0;
        bValue = b.goals ?? 0;
        break;
      case "assists":
        aValue = a.assists ?? 0;
        bValue = b.assists ?? 0;
        break;
      case "saves":
        aValue = a.saves ?? 0;
        bValue = b.saves ?? 0;
        break;
      case "demos":
        aValue = a.demos ?? 0;
        bValue = b.demos ?? 0;
        break;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === "asc"
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  return (
    <>
      {/* Team Stats Modal */}
      <TeamModal
        team={
          showModal && selectedTeam
            ? {
                ...selectedTeam,
                rosteredBy:
                  (selectedTeam.rank ?? 0) % 2 === 0
                    ? { rosterName: "Fantastic Ballers", managerName: "xenn" }
                    : undefined,
              }
            : null
        }
        onClose={() => setShowModal(false)}
      />

      <main>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            padding: "1.5rem 0",
            borderBottom: "2px solid rgba(242, 182, 50, 0.2)",
          }}
        >
          {/* Left: Logo and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {isAdmin ? (
              <Link
                href="/admin"
                style={{
                  display: "block",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Image
                  src="/mle-logo.png"
                  alt="MLE Logo"
                  width={80}
                  height={80}
                  style={{ display: "block" }}
                />
              </Link>
            ) : (
              <Image
                src="/mle-logo.png"
                alt="MLE Logo"
                width={80}
                height={80}
                style={{ display: "block" }}
              />
            )}
            <div>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 900,
                  marginBottom: "0.25rem",
                  background:
                    "linear-gradient(90deg, var(--mle-gold), #ffd700)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.02em",
                }}
              >
                MINOR LEAGUE ESPORTS
              </h1>
              <p
                style={{
                  fontSize: "2.0rem",
                  fontFamily: "var(--font-zuume)",
                  color: "var(--text-muted)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                RL Fantasy
              </p>
            </div>
          </div>

          {/* Right: User Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "flex-end",
            }}
          >
            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              style={{
                padding: "0.65rem 1.5rem",
                backgroundColor: "rgba(42, 75, 130, 0.85)",
                color: "var(--text-main)",
                border: "2px solid rgba(242, 182, 50, 0.5)",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(42, 75, 130, 0.95)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(42, 75, 130, 0.85)";
                e.currentTarget.style.borderColor = "rgba(242, 182, 50, 0.5)";
              }}
            >
              Sign Out
            </button>

            {/* Help Section */}
            <div
              style={{
                textAlign: "right",
                padding: "0.75rem 1rem",
                backgroundColor: "rgba(42, 75, 130, 0.85)",
                borderRadius: "12px",
                border: "1px solid rgba(242, 182, 50, 0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.25rem",
                }}
              >
                Need Help?
              </div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                Contact MLE Mailbox
              </div>
            </div>
          </div>
        </div>

        {/* Your Leagues Section - Horizontal Bar */}
        <section className="card" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div className="card-header" style={{ marginBottom: 0 }}>
              <h2 className="card-title">Your Leagues</h2>
            </div>

            {mockLeagues.length === 0 ? (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  margin: 0,
                }}
              >
                No leagues yet
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  flex: 1,
                  justifyContent: "flex-end",
                }}
              >
                {mockLeagues.map((league) => (
                  <Link
                    key={league.id}
                    href={`/leagues/${league.id}`}
                    className="btn btn-ghost"
                    style={{
                      textDecoration: "none",
                      padding: "0.75rem 1.25rem",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                    }}
                  >
                    {league.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Global Leaderboard Section */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Manager Stats</h2>
            <span className="card-subtitle">
              Top 10 performers across all leagues
            </span>
          </div>

          <div style={{ marginTop: "1rem", overflowX: "auto" }}>
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
                    Rank
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
                    Team
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
                    W-L
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
                    Win %
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
                    Total Pts
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
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockGlobalLeaderboard.map((player) => (
                  <tr
                    key={player.rank}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      backgroundColor: player.isYou
                        ? "rgba(242, 182, 50, 0.08)"
                        : "transparent",
                      borderLeft: player.isYou
                        ? "3px solid var(--accent)"
                        : "3px solid transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: player.rank <= 3 ? "var(--accent)" : "inherit",
                      }}
                    >
                      {player.rank}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                      {player.manager}
                      {player.isYou && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontSize: "0.75rem",
                            color: "var(--accent)",
                          }}
                        >
                          (You)
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {player.team}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {player.league}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "center",
                        fontWeight: 500,
                      }}
                    >
                      <span style={{ color: "#22c55e" }}>{player.wins}</span>-
                      <span style={{ color: "#ef4444" }}>{player.losses}</span>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {player.winRate.toFixed(0)}%
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "right",
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {player.totalPoints.toFixed(1)}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "right",
                        color: "var(--text-muted)",
                      }}
                    >
                      {player.avgPoints.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Team Stats Section */}
        <section className="card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <h2 className="card-title">Team Stats</h2>
            <span className="card-subtitle">Top 10 performing MLE teams</span>
          </div>

          <div style={{ marginTop: "1rem", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  <SortableHeader
                    column="rank"
                    label="Rank"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="name"
                    label="Team"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="score"
                    label="Score"
                    align="right"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="fpts"
                    label="Fpts"
                    align="right"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="last"
                    label="Last"
                    align="right"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="avg"
                    label="Avg"
                    align="right"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="shots"
                    label="Shots"
                    align="right"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="goals"
                    label="Goals"
                    align="right"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="assists"
                    label="Assists"
                    align="right"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="saves"
                    label="Saves"
                    align="right"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    column="demos"
                    label="Demos"
                    align="right"
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team) => (
                  <tr
                    key={team.rank}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: team.rank <= 3 ? "var(--accent)" : "inherit",
                      }}
                    >
                      {team.rank}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Image
                          src={team.logoPath}
                          alt={`${team.name} logo`}
                          width={24}
                          height={24}
                          style={{ borderRadius: "4px" }}
                        />
                        <span
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowModal(true);
                          }}
                          style={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            color: "var(--text-main)",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--accent)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--text-main)")
                          }
                        >
                          {team.leagueId} {team.name}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "right",
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {team.score}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      {team.fpts}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "right",
                        color: "var(--text-muted)",
                      }}
                    >
                      {team.last}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "right",
                        color: "var(--text-muted)",
                      }}
                    >
                      {team.avg}
                    </td>
                    <td
                      style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}
                    >
                      {team.shots}
                    </td>
                    <td
                      style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}
                    >
                      {team.goals}
                    </td>
                    <td
                      style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}
                    >
                      {team.assists}
                    </td>
                    <td
                      style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}
                    >
                      {team.saves}
                    </td>
                    <td
                      style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}
                    >
                      {team.demos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
