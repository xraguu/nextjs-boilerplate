"use client";

import { useState, useEffect } from "react";

interface League {
  id: string;
  name: string;
  season: number;
  numTeams: number;
}

export default function GenerateSchedulePage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [scheduleType, setScheduleType] = useState<"regular" | "playoffs">("regular");
  const [shuffle, setShuffle] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch leagues on mount
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch("/api/admin/leagues");
        if (response.ok) {
          const data = await response.json();
          setLeagues(data.leagues || []);
        }
      } catch (err) {
        console.error("Error fetching leagues:", err);
      }
    };

    fetchLeagues();
  }, []);

  const handleGenerateSchedule = async () => {
    if (!selectedLeagueId) {
      alert("Please select a league");
      return;
    }

    if (!confirm(`Generate ${scheduleType} schedule for this league? This will delete any existing matchups for the selected weeks.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch(
        `/api/admin/leagues/${selectedLeagueId}/generate-schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: scheduleType,
            shuffle,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        alert(data.message);
      } else {
        setError(data.error || "Failed to generate schedule");
        alert(`Error: ${data.error || "Failed to generate schedule"}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--accent)",
          marginBottom: "1.5rem",
        }}
      >
        Generate League Schedule
      </h1>

      <div
        className="card"
        style={{ padding: "2rem", marginBottom: "2rem" }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 600,
              color: "var(--text-main)",
            }}
          >
            Select League
          </label>
          <select
            value={selectedLeagueId}
            onChange={(e) => setSelectedLeagueId(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "var(--text-main)",
              fontSize: "1rem",
            }}
          >
            <option value="">-- Select a league --</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name} ({league.season}) - {league.numTeams} teams
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 600,
              color: "var(--text-main)",
            }}
          >
            Schedule Type
          </label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="radio"
                value="regular"
                checked={scheduleType === "regular"}
                onChange={() => setScheduleType("regular")}
                style={{ accentColor: "var(--accent)" }}
              />
              <span style={{ color: "var(--text-main)" }}>
                Regular Season (Weeks 1-8)
              </span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="radio"
                value="playoffs"
                checked={scheduleType === "playoffs"}
                onChange={() => setScheduleType("playoffs")}
                style={{ accentColor: "var(--accent)" }}
              />
              <span style={{ color: "var(--text-main)" }}>
                Playoffs (Week 9)
              </span>
            </label>
          </div>
          <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {scheduleType === "regular"
              ? "Generates a round-robin schedule for 8 weeks of regular season"
              : "Generates playoff bracket (week 9) based on current standings. Top 8 teams: 1v8, 2v7, 3v6, 4v5"}
          </p>
        </div>

        {scheduleType === "regular" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                Shuffle team order
              </span>
            </label>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Randomizes team order before generating schedule for variety
            </p>
          </div>
        )}

        <button
          onClick={handleGenerateSchedule}
          disabled={loading || !selectedLeagueId}
          className="btn btn-primary"
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.1rem",
            opacity: loading || !selectedLeagueId ? 0.5 : 1,
            cursor: loading || !selectedLeagueId ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating..." : `Generate ${scheduleType === "regular" ? "Regular Season" : "Playoff"} Schedule`}
        </button>
      </div>

      {result && (
        <div
          className="card"
          style={{
            padding: "2rem",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderColor: "#22c55e",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#22c55e",
              marginBottom: "1rem",
            }}
          >
            ✓ Schedule Generated Successfully
          </h2>
          <p style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>
            {result.message}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Created {result.matchupsCreated} matchups
          </p>

          {result.standings && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  marginBottom: "0.75rem",
                }}
              >
                Playoff Seeding (Top 8)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {result.standings.map((team: any, index: number) => (
                  <div
                    key={team.id}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--text-main)" }}>
                      {index + 1}. {team.displayName}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {team.wins}-{team.losses} ({team.pointsFor.toFixed(1)} PF)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            padding: "2rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "#ef4444",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ef4444",
              marginBottom: "1rem",
            }}
          >
            ✗ Error
          </h2>
          <p style={{ color: "var(--text-main)" }}>{error}</p>
        </div>
      )}

      <div className="card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
          How It Works
        </h3>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
          <li>
            <strong>Regular Season:</strong> Generates a round-robin schedule for weeks 1-8.
            Each team plays different opponents each week.
          </li>
          <li>
            <strong>Shuffle:</strong> Randomizes the team order before generating the schedule
            to create variety.
          </li>
          <li>
            <strong>Playoffs Week 9:</strong> Top 8 teams compete in quarterfinals
            (1v8, 2v7, 3v6, 4v5) based on regular season standings.
          </li>
          <li>
            <strong>Week 10:</strong> Semifinals will be generated automatically after week 9
            results are finalized (top 4 winners advance).
          </li>
        </ul>
      </div>
    </div>
  );
}
