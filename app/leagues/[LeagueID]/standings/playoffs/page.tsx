"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Standing {
  rank: number;
  fantasyTeamId: string;
  manager: string;
  team: string;
  wins: number;
  losses: number;
  points: number;
}

interface TeamProps {
  seed: number;
  teamName: string;
  manager: string;
  record: string;
  score: number;
  leagueId: string;
  onManagerClick: (manager: string) => void;
}

const TeamCard = ({ seed, teamName, manager, record, score, onManagerClick }: TeamProps) => {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e2139 0%, #252844 100%)",
      borderRadius: "8px",
      padding: "1rem 1.25rem",
      border: "2px solid rgba(74, 85, 162, 0.3)",
      minHeight: "70px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {seed > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)",
            color: "#1a1a2e",
            fontWeight: 700,
            fontSize: "1rem",
            width: "28px",
            height: "28px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            {seed}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            onClick={() => onManagerClick(manager)}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#ffffff"}
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "0.25rem",
              cursor: "pointer",
              transition: "color 0.2s"
            }}
          >
            {teamName}
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
            <span
              onClick={() => onManagerClick(manager)}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
              style={{
                cursor: "pointer",
                transition: "color 0.2s"
              }}
            >
              {manager}
            </span> {record}
          </div>
        </div>
        <div style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#f2b632"
        }}>
          {score.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

export default function PlayoffsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.LeagueID as string;

  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch standings data
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/leagues/${leagueId}/standings`);

        if (!response.ok) {
          throw new Error("Failed to fetch standings");
        }

        const data = await response.json();
        setStandings(data.standings || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load standings");
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchStandings();
    }
  }, [leagueId]);

  const handleManagerClick = (manager: string) => {
    router.push(`/leagues/${leagueId}/opponents?manager=${encodeURIComponent(manager)}`);
  };

  // Create projected playoff matchups from current standings
  const getTeamByRank = (rank: number) => {
    const team = standings.find(s => s.rank === rank);
    if (!team) return null;
    return {
      seed: rank,
      teamName: team.team,
      manager: team.manager,
      record: `${team.wins}-${team.losses}`,
      score: team.points
    };
  };

  if (loading) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Loading playoffs bracket...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#ef4444", fontSize: "1.1rem" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  // Semi Finals matchups
  const semiFinal1Team1 = getTeamByRank(1);
  const semiFinal1Team2 = getTeamByRank(4);
  const semiFinal2Team1 = getTeamByRank(2);
  const semiFinal2Team2 = getTeamByRank(3);

  // Grand Finals (projected winners - higher seeds) - remove seed numbers
  const grandFinalTeam1 = semiFinal1Team1 ? { ...semiFinal1Team1, seed: 0 } : null;
  const grandFinalTeam2 = semiFinal2Team1 ? { ...semiFinal2Team1, seed: 0 } : null;

  // 3rd Place Game (projected losers - lower seeds) - remove seed numbers
  const thirdPlaceTeam1 = semiFinal1Team2 ? { ...semiFinal1Team2, seed: 0 } : null;
  const thirdPlaceTeam2 = semiFinal2Team2 ? { ...semiFinal2Team2, seed: 0 } : null;

  // Consolation Round 1 matchups (4 matchups)
  const consolationR1 = [
    { team1: getTeamByRank(5), team2: getTeamByRank(12) },
    { team1: getTeamByRank(6), team2: getTeamByRank(11) },
    { team1: getTeamByRank(7), team2: getTeamByRank(10) },
    { team1: getTeamByRank(8), team2: getTeamByRank(9) },
  ];

  // Consolation Round 2 (4 matchups: winners bracket + losers bracket) - remove seed numbers
  const consolationR2Winners = [
    {
      team1: getTeamByRank(5) ? { ...getTeamByRank(5)!, seed: 0 } : null,
      team2: getTeamByRank(6) ? { ...getTeamByRank(6)!, seed: 0 } : null
    },
    {
      team1: getTeamByRank(7) ? { ...getTeamByRank(7)!, seed: 0 } : null,
      team2: getTeamByRank(8) ? { ...getTeamByRank(8)!, seed: 0 } : null
    },
  ];

  const consolationR2Losers = [
    {
      team1: getTeamByRank(12) ? { ...getTeamByRank(12)!, seed: 0 } : null,
      team2: getTeamByRank(11) ? { ...getTeamByRank(11)!, seed: 0 } : null
    },
    {
      team1: getTeamByRank(10) ? { ...getTeamByRank(10)!, seed: 0 } : null,
      team2: getTeamByRank(9) ? { ...getTeamByRank(9)!, seed: 0 } : null
    },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => router.push(`/leagues/${leagueId}/standings`)}
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
          ← Back to Standings
        </button>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          color: "#f2b632",
          margin: 0
        }}>
          Playoffs
        </h1>
      </div>

      {/* Semi Finals and Grand Finals Section */}
      <div style={{
        background: "transparent",
        borderRadius: "12px",
        padding: "0",
        marginBottom: "3rem"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          marginBottom: "3rem"
        }}>
          {/* Semi Finals */}
          <div>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              marginBottom: "1.5rem",
              textAlign: "center",
              borderBottom: "2px solid rgba(255,255,255,0.1)",
              paddingBottom: "0.75rem"
            }}>
              Semi Finals
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {semiFinal1Team1 && (
                <TeamCard
                  {...semiFinal1Team1}
                  leagueId={leagueId}
                  onManagerClick={handleManagerClick}
                />
              )}
              {semiFinal1Team2 && (
                <TeamCard
                  {...semiFinal1Team2}
                  leagueId={leagueId}
                  onManagerClick={handleManagerClick}
                />
              )}
            </div>

            {/* Second Semi Final */}
            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {semiFinal2Team1 && (
                <TeamCard
                  {...semiFinal2Team1}
                  leagueId={leagueId}
                  onManagerClick={handleManagerClick}
                />
              )}
              {semiFinal2Team2 && (
                <TeamCard
                  {...semiFinal2Team2}
                  leagueId={leagueId}
                  onManagerClick={handleManagerClick}
                />
              )}
            </div>
          </div>

          {/* Grand Finals and 3rd Place */}
          <div>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              marginBottom: "1.5rem",
              textAlign: "center",
              borderBottom: "2px solid rgba(255,255,255,0.1)",
              paddingBottom: "0.75rem"
            }}>
              Grand Finals
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {grandFinalTeam1 && (
                <TeamCard
                  {...grandFinalTeam1}
                  leagueId={leagueId}
                  onManagerClick={handleManagerClick}
                />
              )}
              {grandFinalTeam2 && (
                <TeamCard
                  {...grandFinalTeam2}
                  leagueId={leagueId}
                  onManagerClick={handleManagerClick}
                />
              )}
            </div>

            {/* 3rd Place Game */}
            <div style={{ marginTop: "2rem" }}>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginBottom: "1.5rem",
                textAlign: "center",
                borderBottom: "2px solid rgba(255,255,255,0.1)",
                paddingBottom: "0.75rem"
              }}>
                3rd Place Game
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {thirdPlaceTeam1 && (
                  <TeamCard
                    {...thirdPlaceTeam1}
                    leagueId={leagueId}
                    onManagerClick={handleManagerClick}
                  />
                )}
                {thirdPlaceTeam2 && (
                  <TeamCard
                    {...thirdPlaceTeam2}
                    leagueId={leagueId}
                    onManagerClick={handleManagerClick}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consolation Rounds Section */}
      <div style={{
        background: "transparent",
        borderRadius: "12px",
        padding: "0",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem"
        }}>
          {/* Consolation Round 1 */}
          <div>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              marginBottom: "1.5rem",
              textAlign: "center",
              borderBottom: "2px solid rgba(255,255,255,0.1)",
              paddingBottom: "0.75rem"
            }}>
              Consolation Round 1
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {consolationR1.map((matchup, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {matchup.team1 && (
                    <TeamCard
                      {...matchup.team1}
                      leagueId={leagueId}
                      onManagerClick={handleManagerClick}
                    />
                  )}
                  {matchup.team2 && (
                    <TeamCard
                      {...matchup.team2}
                      leagueId={leagueId}
                      onManagerClick={handleManagerClick}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Consolation Round 2 */}
          <div>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              marginBottom: "1.5rem",
              textAlign: "center",
              borderBottom: "2px solid rgba(255,255,255,0.1)",
              paddingBottom: "0.75rem"
            }}>
              Consolation Round 2
            </h2>

            {/* Winners Bracket */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                marginBottom: "1rem",
                textAlign: "center"
              }}>
                Winners Bracket
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {consolationR2Winners.map((matchup, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {matchup.team1 && (
                      <TeamCard
                        {...matchup.team1}
                        leagueId={leagueId}
                        onManagerClick={handleManagerClick}
                      />
                    )}
                    {matchup.team2 && (
                      <TeamCard
                        {...matchup.team2}
                        leagueId={leagueId}
                        onManagerClick={handleManagerClick}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Losers Bracket */}
            <div>
              <h3 style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                marginBottom: "1rem",
                textAlign: "center"
              }}>
                Losers Bracket
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {consolationR2Losers.map((matchup, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {matchup.team1 && (
                      <TeamCard
                        {...matchup.team1}
                        leagueId={leagueId}
                        onManagerClick={handleManagerClick}
                      />
                    )}
                    {matchup.team2 && (
                      <TeamCard
                        {...matchup.team2}
                        leagueId={leagueId}
                        onManagerClick={handleManagerClick}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
