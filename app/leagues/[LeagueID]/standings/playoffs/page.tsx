"use client";

import { useParams, useRouter } from "next/navigation";

// Mock playoff data
const mockPlayoffData = {
  semiFinals: [
    {
      seed: 1,
      teamName: "Fantastic Ballers",
      manager: "xenn",
      record: "2-1",
      division: "3rd",
      score: 198
    },
    {
      seed: 4,
      teamName: "Pixies",
      manager: "Crazy",
      record: "0-3",
      division: "9th",
      score: 198
    }
  ],
  semiFinals2: [
    {
      seed: 2,
      teamName: "Bar Demons",
      manager: "xenn",
      record: "2-1",
      division: "3rd",
      score: 198
    },
    {
      seed: 3,
      teamName: "Whiffers",
      manager: "Crazy",
      record: "0-3",
      division: "9th",
      score: 198
    }
  ],
  grandFinals: [
    {
      seed: 1,
      teamName: "Fantastic Ballers",
      manager: "xenn",
      record: "2-1",
      division: "3rd",
      score: 198
    },
    {
      seed: 3,
      teamName: "Whiffers",
      manager: "Crazy",
      record: "0-3",
      division: "9th",
      score: 198
    }
  ],
  consolationRound1: [
    {
      matchupId: 1,
      teams: [
        {
          seed: 5,
          teamName: "Fantastic Ballers",
          manager: "xenn",
          record: "2-1",
          division: "3rd",
          score: 198
        },
        {
          seed: 12,
          teamName: "Pixies",
          manager: "Crazy",
          record: "0-3",
          division: "9th",
          score: 198
        }
      ]
    },
    {
      matchupId: 2,
      teams: [
        {
          seed: 6,
          teamName: "Fantastic Ballers",
          manager: "xenn",
          record: "2-1",
          division: "3rd",
          score: 198
        },
        {
          seed: 11,
          teamName: "Pixies",
          manager: "Crazy",
          record: "0-3",
          division: "9th",
          score: 198
        }
      ]
    },
    {
      matchupId: 3,
      teams: [
        {
          seed: 7,
          teamName: "Fantastic Ballers",
          manager: "xenn",
          record: "2-1",
          division: "3rd",
          score: 198
        },
        {
          seed: 10,
          teamName: "Pixies",
          manager: "Crazy",
          record: "0-3",
          division: "9th",
          score: 198
        }
      ]
    }
  ],
  consolationRound2: [
    {
      matchupId: 4,
      teams: [
        {
          seed: 5,
          teamName: "Fantastic Ballers",
          manager: "xenn",
          record: "2-1",
          division: "3rd",
          score: 198
        },
        {
          seed: 12,
          teamName: "Pixies",
          manager: "Crazy",
          record: "0-3",
          division: "9th",
          score: 198
        }
      ]
    },
    {
      matchupId: 5,
      teams: [
        {
          seed: 6,
          teamName: "Fantastic Ballers",
          manager: "xenn",
          record: "2-1",
          division: "3rd",
          score: 198
        },
        {
          seed: 11,
          teamName: "Pixies",
          manager: "Crazy",
          record: "0-3",
          division: "9th",
          score: 198
        }
      ]
    },
    {
      matchupId: 6,
      teams: [
        {
          seed: 6,
          teamName: "Fantastic Ballers",
          manager: "xenn",
          record: "2-1",
          division: "3rd",
          score: 198
        },
        {
          seed: 11,
          teamName: "Pixies",
          manager: "Crazy",
          record: "0-3",
          division: "9th",
          score: 198
        }
      ]
    }
  ]
};

interface TeamProps {
  seed: number;
  teamName: string;
  manager: string;
  record: string;
  division: string;
  score: number;
  leagueId: string;
  onManagerClick: (manager: string) => void;
}

const TeamCard = ({ seed, teamName, manager, record, division, score, leagueId, onManagerClick }: TeamProps) => {
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
            </span> {record} {division}
          </div>
        </div>
        <div style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#f2b632"
        }}>
          {score}
        </div>
      </div>
    </div>
  );
};

export default function PlayoffsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.LeagueID as string;

  const handleManagerClick = (manager: string) => {
    router.push(`/leagues/${leagueId}/opponents?manager=${encodeURIComponent(manager)}`);
  };

  const handleMatchupClick = (matchupId: string, week: number = 14) => {
    // Navigate to scoreboard matchup page
    router.push(`/leagues/${leagueId}/scoreboard?week=${week}&matchup=${matchupId}`);
  };

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
              <TeamCard
                seed={mockPlayoffData.semiFinals[0].seed}
                teamName={mockPlayoffData.semiFinals[0].teamName}
                manager={mockPlayoffData.semiFinals[0].manager}
                record={mockPlayoffData.semiFinals[0].record}
                division={mockPlayoffData.semiFinals[0].division}
                score={mockPlayoffData.semiFinals[0].score}
                leagueId={leagueId}
                onManagerClick={handleManagerClick}
              />
              <TeamCard
                seed={mockPlayoffData.semiFinals[1].seed}
                teamName={mockPlayoffData.semiFinals[1].teamName}
                manager={mockPlayoffData.semiFinals[1].manager}
                record={mockPlayoffData.semiFinals[1].record}
                division={mockPlayoffData.semiFinals[1].division}
                score={mockPlayoffData.semiFinals[1].score}
                leagueId={leagueId}
                onManagerClick={handleManagerClick}
              />
            </div>

            {/* Second Semi Final */}
            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <TeamCard
                seed={mockPlayoffData.semiFinals2[0].seed}
                teamName={mockPlayoffData.semiFinals2[0].teamName}
                manager={mockPlayoffData.semiFinals2[0].manager}
                record={mockPlayoffData.semiFinals2[0].record}
                division={mockPlayoffData.semiFinals2[0].division}
                score={mockPlayoffData.semiFinals2[0].score}
                leagueId={leagueId}
                onManagerClick={handleManagerClick}
              />
              <TeamCard
                seed={mockPlayoffData.semiFinals2[1].seed}
                teamName={mockPlayoffData.semiFinals2[1].teamName}
                manager={mockPlayoffData.semiFinals2[1].manager}
                record={mockPlayoffData.semiFinals2[1].record}
                division={mockPlayoffData.semiFinals2[1].division}
                score={mockPlayoffData.semiFinals2[1].score}
                leagueId={leagueId}
                onManagerClick={handleManagerClick}
              />
            </div>
          </div>

          {/* Grand Finals */}
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
              <TeamCard
                seed={mockPlayoffData.grandFinals[0].seed}
                teamName={mockPlayoffData.grandFinals[0].teamName}
                manager={mockPlayoffData.grandFinals[0].manager}
                record={mockPlayoffData.grandFinals[0].record}
                division={mockPlayoffData.grandFinals[0].division}
                score={mockPlayoffData.grandFinals[0].score}
                leagueId={leagueId}
                onManagerClick={handleManagerClick}
              />
              <TeamCard
                seed={mockPlayoffData.grandFinals[1].seed}
                teamName={mockPlayoffData.grandFinals[1].teamName}
                manager={mockPlayoffData.grandFinals[1].manager}
                record={mockPlayoffData.grandFinals[1].record}
                division={mockPlayoffData.grandFinals[1].division}
                score={mockPlayoffData.grandFinals[1].score}
                leagueId={leagueId}
                onManagerClick={handleManagerClick}
              />
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
              {mockPlayoffData.consolationRound1.map((matchup) => (
                <div key={matchup.matchupId} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <TeamCard
                    seed={matchup.teams[0].seed}
                    teamName={matchup.teams[0].teamName}
                    manager={matchup.teams[0].manager}
                    record={matchup.teams[0].record}
                    division={matchup.teams[0].division}
                    score={matchup.teams[0].score}
                    leagueId={leagueId}
                    onManagerClick={handleManagerClick}
                  />
                  <TeamCard
                    seed={matchup.teams[1].seed}
                    teamName={matchup.teams[1].teamName}
                    manager={matchup.teams[1].manager}
                    record={matchup.teams[1].record}
                    division={matchup.teams[1].division}
                    score={matchup.teams[1].score}
                    leagueId={leagueId}
                    onManagerClick={handleManagerClick}
                  />
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
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {mockPlayoffData.consolationRound2.map((matchup) => (
                <div key={matchup.matchupId} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <TeamCard
                    seed={matchup.teams[0].seed}
                    teamName={matchup.teams[0].teamName}
                    manager={matchup.teams[0].manager}
                    record={matchup.teams[0].record}
                    division={matchup.teams[0].division}
                    score={matchup.teams[0].score}
                    leagueId={leagueId}
                    onManagerClick={handleManagerClick}
                  />
                  <TeamCard
                    seed={matchup.teams[1].seed}
                    teamName={matchup.teams[1].teamName}
                    manager={matchup.teams[1].manager}
                    record={matchup.teams[1].record}
                    division={matchup.teams[1].division}
                    score={matchup.teams[1].score}
                    leagueId={leagueId}
                    onManagerClick={handleManagerClick}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
