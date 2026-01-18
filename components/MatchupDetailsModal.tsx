"use client";

import Image from "next/image";

interface MatchupLineupSlot {
  position: string;
  slotIndex: number;
  team: {
    id: string;
    name: string;
    leagueId: string;
    logoPath: string;
    primaryColor: string;
    secondaryColor: string;
  };
  stats: {
    goals: number;
    shots: number;
    saves: number;
    assists: number;
    demosInflicted: number;
    demosTaken: number;
    sprocketRating: number;
  } | null;
  fantasyPoints: number | null;
}

interface MatchupTeam {
  id: string;
  displayName: string;
  manager: string;
  isHome: boolean;
  lineup: MatchupLineupSlot[];
}

interface MatchupData {
  id: string;
  week: number;
  homeScore: number | null;
  awayScore: number | null;
  myTeam: MatchupTeam;
  oppTeam: MatchupTeam;
}

interface MatchupDetailsModalProps {
  matchupData: {
    rostered: boolean;
    matchup: MatchupData | null;
    message?: string;
  } | null;
  onClose: () => void;
  isLoading: boolean;
}

export default function MatchupDetailsModal({
  matchupData,
  onClose,
  isLoading,
}: MatchupDetailsModalProps) {
  if (!matchupData && !isLoading) return null;

  const renderLineup = (team: MatchupTeam, isMyTeam: boolean) => {
    // Group lineup by position
    const starters = team.lineup.filter((slot) => slot.position === "Starter");
    const bench = team.lineup.filter((slot) => slot.position === "Bench");

    return (
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          <h4
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
            }}
          >
            {team.displayName}
          </h4>
          <div
            style={{
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.7)",
              marginTop: "0.25rem",
            }}
          >
            {team.manager}
          </div>
        </div>

        {/* Starters */}
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Starters
          </div>
          {starters.map((slot, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.75rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "6px",
                marginBottom: "0.5rem",
                gap: "1rem",
              }}
            >
              <Image
                src={slot.team.logoPath}
                alt={slot.team.name}
                width={40}
                height={40}
                style={{ borderRadius: "4px" }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  {slot.team.leagueId} {slot.team.name}
                </div>
                {slot.stats && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.6)",
                      marginTop: "0.25rem",
                    }}
                  >
                    G: {slot.stats.goals} | S: {slot.stats.shots} | Sv:{" "}
                    {slot.stats.saves} | A: {slot.stats.assists}
                  </div>
                )}
              </div>
              {slot.fantasyPoints !== null && (
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#4ade80",
                  }}
                >
                  {slot.fantasyPoints.toFixed(1)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bench */}
        {bench.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Bench
            </div>
            {bench.map((slot, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.75rem",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  gap: "1rem",
                  opacity: 0.7,
                }}
              >
                <Image
                  src={slot.team.logoPath}
                  alt={slot.team.name}
                  width={40}
                  height={40}
                  style={{ borderRadius: "4px" }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#ffffff",
                    }}
                  >
                    {slot.team.leagueId} {slot.team.name}
                  </div>
                  {slot.stats && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.6)",
                        marginTop: "0.25rem",
                      }}
                    >
                      G: {slot.stats.goals} | S: {slot.stats.shots} | Sv:{" "}
                      {slot.stats.saves} | A: {slot.stats.assists}
                    </div>
                  )}
                </div>
                {slot.fantasyPoints !== null && (
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {slot.fantasyPoints.toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "1000px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          borderRadius: "12px",
          padding: "2rem",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
            }}
          >
            {isLoading
              ? "Loading Matchup..."
              : matchupData?.matchup
              ? `Week ${matchupData.matchup.week} Matchup`
              : "Matchup Details"}
          </h2>
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
              backdropFilter: "blur(4px)",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Loading matchup details...
          </div>
        ) : !matchupData?.rostered ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {matchupData?.message ||
              "This team was not rostered in the specified week"}
          </div>
        ) : !matchupData?.matchup ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            No matchup found for this week
          </div>
        ) : (
          <>
            {/* Score Display */}
            {matchupData.matchup.homeScore !== null &&
              matchupData.matchup.awayScore !== null && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "2rem",
                    marginBottom: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "rgba(255,255,255,0.7)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {matchupData.matchup.myTeam.displayName}
                    </div>
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "#ffffff",
                      }}
                    >
                      {matchupData.matchup.myTeam.isHome
                        ? matchupData.matchup.homeScore.toFixed(1)
                        : matchupData.matchup.awayScore.toFixed(1)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    -
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "rgba(255,255,255,0.7)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {matchupData.matchup.oppTeam.displayName}
                    </div>
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "#ffffff",
                      }}
                    >
                      {matchupData.matchup.oppTeam.isHome
                        ? matchupData.matchup.homeScore.toFixed(1)
                        : matchupData.matchup.awayScore.toFixed(1)}
                    </div>
                  </div>
                </div>
              )}

            {/* Lineups */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
              }}
            >
              <div>
                {renderLineup(matchupData.matchup.myTeam, true)}
              </div>
              <div>
                {renderLineup(matchupData.matchup.oppTeam, false)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
