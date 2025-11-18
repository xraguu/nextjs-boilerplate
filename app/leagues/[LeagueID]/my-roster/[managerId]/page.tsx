"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

// Mock roster data with full stats
const mockRoster = {
  managerName: "xenn",
  teamName: "Fantastic Ballers",
  record: { wins: 2, losses: 1, place: "3rd" },
  totalPoints: 543,
  avgPoints: 181,
  currentWeek: 3,
  lastMatchup: {
    myTeam: "Fantastic Ballers",
    myScore: 157,
    opponent: "Pixies",
    opponentScore: 142
  },
  currentMatchup: {
    myTeam: "Fantastic Ballers",
    myScore: 169,
    opponent: "Whiffers",
    opponentScore: 135
  },
  teams: [
    // 2v2 Slots
    { slot: "2s", name: "Flames CL", score: 48.5, opponent: "Puffins CL", oprk: 2, fprk: 1, fpts: 425.0, avg: 53.1, last: 52.0, goals: 145, shots: 892, saves: 234, assists: 98, demos: 67, teamRecord: "8-2" },
    { slot: "2s", name: "Torch ML", score: 46.0, opponent: "Eclipse ML", oprk: 5, fprk: 2, fpts: 398.5, avg: 49.8, last: 48.5, goals: 138, shots: 856, saves: 221, assists: 94, demos: 62, teamRecord: "7-3" },
    // 3v3 Slots
    { slot: "3s", name: "Puffins CL", score: 45.5, opponent: "Flames CL", oprk: 1, fprk: 3, fpts: 385.0, avg: 48.1, last: 46.0, goals: 132, shots: 824, saves: 215, assists: 89, demos: 58, teamRecord: "6-4" },
    { slot: "3s", name: "Eclipse ML", score: 44.0, opponent: "Torch ML", oprk: 3, fprk: 4, fpts: 372.5, avg: 46.6, last: 45.0, goals: 128, shots: 798, saves: 208, assists: 86, demos: 55, teamRecord: "6-4" },
    // Flex Slot
    { slot: "FLX", name: "Vortex CL", score: 43.5, opponent: "Lightning DL", oprk: 6, fprk: 5, fpts: 368.0, avg: 46.0, last: 44.5, goals: 125, shots: 782, saves: 202, assists: 83, demos: 53, teamRecord: "5-5" },
    // Bench
    { slot: "BE", name: "Lightning DL", score: 0, opponent: "Vortex CL", oprk: 4, fprk: 6, fpts: 356.0, avg: 44.5, last: 43.0, goals: 121, shots: 765, saves: 198, assists: 81, demos: 51, teamRecord: "5-5" },
    { slot: "BE", name: "Phoenix ML", score: 0, opponent: "Storm CL", oprk: 8, fprk: 7, fpts: 342.5, avg: 42.8, last: 41.5, goals: 116, shots: 743, saves: 189, assists: 77, demos: 48, teamRecord: "4-6" },
    { slot: "BE", name: "Storm CL", score: 0, opponent: "Phoenix ML", oprk: 7, fprk: 8, fpts: 335.0, avg: 41.9, last: 40.0, goals: 113, shots: 728, saves: 184, assists: 75, demos: 46, teamRecord: "4-6" },
  ]
};

export default function MyRosterPage() {
  const router = useRouter();
  const params = useParams();
  const roster = mockRoster;
  const [currentWeek, setCurrentWeek] = useState(roster.currentWeek);
  const [activeTab, setActiveTab] = useState<"lineup" | "stats">("lineup");
  const [gameMode, setGameMode] = useState<"2s" | "3s">("2s");
  const [flexMode, setFlexMode] = useState<"2s" | "3s">("2s");
  const [benchModes, setBenchModes] = useState<("2s" | "3s")[]>(["2s", "2s", "2s"]);

  const handleScheduleClick = () => {
    router.push(`/leagues/${params.LeagueID}/my-roster/${params.managerId}/schedule`);
  };

  return (
    <>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>Roster</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={handleScheduleClick}
            style={{
              backgroundColor: "var(--accent)",
              color: "#1a1a2e",
              padding: "0.5rem 1.5rem",
              borderRadius: "2rem",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer"
            }}
          >
            Schedule
          </button>
        </div>
      </div>

      {/* Team Overview Card */}
      <section className="card" style={{
        marginBottom: "1.5rem",
        padding: "1.5rem 2rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Team Info */}
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", marginTop: 0 }}>
              {roster.teamName}{" "}
              <span style={{ color: "var(--accent)", marginLeft: "0.75rem" }}>
                {roster.record.wins}-{roster.record.losses}
              </span>{" "}
              <span style={{ color: "var(--text-muted)", fontSize: "1.2rem", marginLeft: "0.5rem" }}>
                {roster.record.place}
              </span>
            </h2>
            <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{roster.managerName}</div>
            <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{roster.totalPoints} Fantasy Points</span>
              <span style={{ color: "var(--text-muted)", marginLeft: "1.5rem" }}>{roster.avgPoints} Avg Fantasy Points</span>
            </div>
          </div>

          {/* Matchup Info */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {/* Last Matchup */}
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", marginBottom: "0.5rem" }}>
                Last Matchup
              </div>
              <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-main)" }}>{roster.lastMatchup.myTeam}</span>{" "}
                <span style={{ color: "var(--accent)", fontWeight: 700, marginLeft: "0.5rem" }}>
                  {roster.lastMatchup.myScore}
                </span>
              </div>
              <div style={{ fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{roster.lastMatchup.opponent}</span>{" "}
                <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  {roster.lastMatchup.opponentScore}
                </span>
              </div>
            </div>

            <div style={{ width: "1px", height: "60px", backgroundColor: "rgba(255,255,255,0.1)" }}></div>

            {/* Current Matchup */}
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", marginBottom: "0.5rem" }}>
                Current Matchup
              </div>
              <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-main)" }}>{roster.currentMatchup.myTeam}</span>{" "}
                <span style={{ color: "var(--accent)", fontWeight: 700, marginLeft: "0.5rem" }}>
                  {roster.currentMatchup.myScore}
                </span>
              </div>
              <div style={{ fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{roster.currentMatchup.opponent}</span>{" "}
                <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  {roster.currentMatchup.opponentScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveTab("lineup")}
          className={activeTab === "lineup" ? "btn btn-primary" : "btn btn-ghost"}
          style={{ fontSize: "1rem" }}
        >
          Lineup
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={activeTab === "stats" ? "btn btn-primary" : "btn btn-ghost"}
          style={{ fontSize: "1rem" }}
        >
          Stats
        </button>
      </div>

      {/* Lineup Tab */}
      {activeTab === "lineup" && (
        <section className="card">
          {/* Week Navigation and Actions */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                ◄ Week {currentWeek - 1}
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                Week {currentWeek}
              </span>
              <button
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                Week {currentWeek + 1} ►
              </button>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-primary" style={{ fontSize: "0.9rem" }}>
                + Add
              </button>
              <button className="btn btn-ghost" style={{ fontSize: "0.9rem" }}>
                - Drop
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", width: "50px" }}></th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Slot</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Score</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Opp</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Oprk</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fprk</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fpts</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Last</th>
                </tr>
              </thead>
              <tbody>
                {roster.teams.map((team, index) => {
                  const isFlex = team.slot === "FLX";
                  const isBench = team.slot === "BE";
                  const benchIndex = isBench ? index - 5 : 0;
                  const currentMode = isFlex ? flexMode : isBench ? benchModes[benchIndex] : team.slot;

                  return (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      backgroundColor: team.slot === "BE" ? "rgba(255,255,255,0.02)" : "transparent",
                      borderTop: team.slot === "BE" && index === 5 ? "2px solid rgba(255,255,255,0.15)" : "none"
                    }}
                  >
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                      {(isFlex || isBench) && (
                        <button
                          onClick={() => {
                            if (isFlex) {
                              setFlexMode(flexMode === "2s" ? "3s" : "2s");
                            } else {
                              const newModes = [...benchModes];
                              newModes[benchIndex] = benchModes[benchIndex] === "2s" ? "3s" : "2s";
                              setBenchModes(newModes);
                            }
                          }}
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: "4px",
                            padding: "0.25rem 0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--accent)",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(242, 182, 50, 0.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        >
                          ⇄
                        </button>
                      )}
                    </td>
                    <td style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: team.slot === "BE" ? "var(--text-muted)" : "var(--accent)"
                    }}>
                      {(isFlex || isBench) ? currentMode : team.slot}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.95rem" }}>
                      {team.name || "-"}
                    </td>
                    <td style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: team.score > 0 ? "var(--accent)" : "var(--text-muted)"
                    }}>
                      {team.score > 0 ? team.score.toFixed(1) : "-"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      {team.opponent || "-"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem" }}>
                      {team.oprk || "-"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", fontWeight: 600 }}>
                      {team.fprk || "-"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.95rem" }}>
                      {team.fpts ? team.fpts.toFixed(1) : "-"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      {team.avg ? team.avg.toFixed(1) : "-"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      {team.last ? team.last.toFixed(1) : "-"}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <section className="card">
          {/* Week Navigation and Mode Toggle */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                ◄ Week {currentWeek - 1}
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                Week {currentWeek}
              </span>
              <button
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="btn btn-ghost"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                Week {currentWeek + 1} ►
              </button>
            </div>
            {/* Game Mode Toggle */}
            <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "0.25rem" }}>
              <button
                onClick={() => setGameMode("2s")}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: gameMode === "2s" ? "var(--accent)" : "transparent",
                  color: gameMode === "2s" ? "#1a1a2e" : "var(--text-main)",
                  transition: "all 0.2s ease"
                }}
              >
                2s
              </button>
              <button
                onClick={() => setGameMode("3s")}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: gameMode === "3s" ? "var(--accent)" : "transparent",
                  color: gameMode === "3s" ? "#1a1a2e" : "var(--text-main)",
                  transition: "all 0.2s ease"
                }}
              >
                3s
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Team</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Score</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fprk</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fpts</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Last</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Goals</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Shots</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Saves</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Assists</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Demos</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Record</th>
                </tr>
              </thead>
              <tbody>
                {roster.teams
                  .filter((team) => {
                    if (team.slot === "2s") return gameMode === "2s";
                    if (team.slot === "3s") return gameMode === "3s";
                    if (team.slot === "FLX") return flexMode === gameMode;
                    if (team.slot === "BE") {
                      const benchIndex = roster.teams.indexOf(team) - 5;
                      return benchModes[benchIndex] === gameMode;
                    }
                    return true;
                  })
                  .sort((a, b) => a.fprk - b.fprk)
                  .map((team, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)"
                      }}
                    >
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)" }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.95rem" }}>
                        {team.name}
                      </td>
                      <td style={{
                        padding: "0.75rem 1rem",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "var(--accent)"
                      }}>
                        {team.score > 0 ? team.score.toFixed(1) : "-"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem", fontWeight: 600 }}>
                        {team.fprk}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.95rem" }}>
                        {team.fpts.toFixed(1)}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        {team.avg.toFixed(1)}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        {team.last.toFixed(1)}
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
                        {team.teamRecord}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
