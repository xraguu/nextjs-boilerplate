"use client";

import { useState, useEffect } from "react";

// Week date structure
interface WeekDate {
  week: number;
  startDate: string;
  endDate: string;
}

// Settings structure matching requirements
const defaultSettings = {
  season: {
    currentYear: 2025,
    currentWeek: 1,
    playoffStartWeek: 9, // Weeks 9-10 are playoffs
    tradeCutoffWeek: 8, // Can't trade during playoffs
    lineupLockTime: "00:01", // 12:01am on game day
  },
  weekDates: Array.from({ length: 10 }, (_, i) => ({
    week: i + 1,
    startDate: "",
    endDate: "",
  })) as WeekDate[],
  scoring: {
    goals: 2,
    shots: 0.1,
    saves: 1,
    assists: 1.5,
    demosInflicted: 0.5,
    demosTaken: -0.5, // Negative example
    sprocketRating: 0.1,
    gameWin: 10,
    gameLoss: 0, // Can be negative
  },
  league: {
    maxTeamsPerLeague: 12, // Fixed
    playoffTeams: 4, // Fixed
  },
  waivers: {
    processingSchedule: [
      { day: "Wednesday", time: "03:00" },
      { day: "Sunday", time: "03:00" }
    ],
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            // Transform API data to match UI structure
            setSettings({
              season: {
                currentYear: data.settings.season,
                currentWeek: data.settings.currentWeek,
                playoffStartWeek: data.settings.playoffStartWeek,
                tradeCutoffWeek: data.settings.tradeCutoffWeek,
                lineupLockTime: data.settings.lineupLockTime,
              },
              weekDates: data.settings.weekDates || defaultSettings.weekDates,
              scoring: data.settings.scoringRules || defaultSettings.scoring,
              league: defaultSettings.league,
              waivers: {
                processingSchedule: data.settings.waiverSchedule || defaultSettings.waivers.processingSchedule,
              },
            });
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSeasonSetting = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      season: {
        ...prev.season,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateScoringSetting = (key: string, value: number) => {
    setSettings((prev) => ({
      ...prev,
      scoring: {
        ...prev.scoring,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateWeekDate = (week: number, field: 'startDate' | 'endDate', value: string) => {
    setSettings((prev) => ({
      ...prev,
      weekDates: prev.weekDates.map(w =>
        w.week === week ? { ...w, [field]: value } : w
      ),
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Transform UI structure to API format
      const apiData = {
        season: settings.season.currentYear,
        currentWeek: settings.season.currentWeek,
        playoffStartWeek: settings.season.playoffStartWeek,
        tradeCutoffWeek: settings.season.tradeCutoffWeek,
        lineupLockTime: settings.season.lineupLockTime,
        weekDates: settings.weekDates,
        scoringRules: settings.scoring,
        waiverSchedule: settings.waivers.processingSchedule,
      };

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
        setHasChanges(false);
      } else {
        const error = await response.json();
        alert(`Failed to save settings: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      setSettings(defaultSettings);
      setHasChanges(true); // Mark as changed so user can save the reset
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Save/Reset Buttons - Sticky Top */}
      {hasChanges && (
        <div
          style={{
            position: "sticky",
            top: "2rem",
            zIndex: 10,
            padding: "1rem",
            background: "var(--bg-surface)",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "2px solid var(--accent)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.95rem",
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            You have unsaved changes
          </span>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn-ghost"
              onClick={resetSettings}
              disabled={isSaving}
            >
              Reset to Defaults
            </button>
            <button
              className="btn btn-primary"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Season Settings */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--accent)",
          }}
        >
          Season Settings
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Current Season
            </label>
            <input
              type="number"
              value={settings.season.currentYear}
              onChange={(e) =>
                updateSeasonSetting("currentYear", Number(e.target.value))
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Current Week
            </label>
            <input
              type="number"
              value={settings.season.currentWeek}
              onChange={(e) =>
                updateSeasonSetting("currentWeek", Number(e.target.value))
              }
              min={1}
              max={10}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Playoff Start Week
            </label>
            <input
              type="number"
              value={settings.season.playoffStartWeek}
              onChange={(e) =>
                updateSeasonSetting("playoffStartWeek", Number(e.target.value))
              }
              min={1}
              max={10}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Fantasy regular season: Weeks 1-8, Playoffs: Weeks 9-10
            </p>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Trade Cutoff Week
            </label>
            <input
              type="number"
              value={settings.season.tradeCutoffWeek}
              onChange={(e) =>
                updateSeasonSetting("tradeCutoffWeek", Number(e.target.value))
              }
              min={1}
              max={10}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              No trades allowed after this week (before playoffs)
            </p>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Lineup Lock Time
            </label>
            <input
              type="time"
              value={settings.season.lineupLockTime}
              onChange={(e) =>
                updateSeasonSetting("lineupLockTime", e.target.value)
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Lineups auto-lock at this time on game day (from fixture dates)
            </p>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-main)" }}>
            Weekly Schedule (10 Weeks)
          </h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {settings.weekDates.map((weekData) => (
              <div
                key={weekData.week}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 1fr",
                  gap: "1rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--accent)" }}>
                  Week {weekData.week}
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={weekData.startDate}
                    onChange={(e) => updateWeekDate(weekData.week, 'startDate', e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "4px",
                      color: "var(--text-main)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={weekData.endDate}
                    onChange={(e) => updateWeekDate(weekData.week, 'endDate', e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "4px",
                      color: "var(--text-main)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scoring Rules */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: "var(--accent)",
          }}
        >
          Scoring Rules
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Points per stat (negative values allowed for penalties)
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Goals
            </label>
            <input
              type="number"
              value={settings.scoring.goals}
              onChange={(e) =>
                updateScoringSetting("goals", Number(e.target.value))
              }
              step={0.1}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Shots
            </label>
            <input
              type="number"
              value={settings.scoring.shots}
              onChange={(e) =>
                updateScoringSetting("shots", Number(e.target.value))
              }
              step={0.1}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Saves
            </label>
            <input
              type="number"
              value={settings.scoring.saves}
              onChange={(e) =>
                updateScoringSetting("saves", Number(e.target.value))
              }
              step={0.1}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Assists
            </label>
            <input
              type="number"
              value={settings.scoring.assists}
              onChange={(e) =>
                updateScoringSetting("assists", Number(e.target.value))
              }
              step={0.1}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Demos Inflicted
            </label>
            <input
              type="number"
              value={settings.scoring.demosInflicted}
              onChange={(e) =>
                updateScoringSetting("demosInflicted", Number(e.target.value))
              }
              step={0.1}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Demos Taken
            </label>
            <input
              type="number"
              value={settings.scoring.demosTaken}
              onChange={(e) =>
                updateScoringSetting("demosTaken", Number(e.target.value))
              }
              step={0.1}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Typically negative (penalty)
            </p>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Sprocket Rating (SR)
            </label>
            <input
              type="number"
              value={settings.scoring.sprocketRating}
              onChange={(e) =>
                updateScoringSetting("sprocketRating", Number(e.target.value))
              }
              step={0.01}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Game Win
            </label>
            <input
              type="number"
              value={settings.scoring.gameWin}
              onChange={(e) =>
                updateScoringSetting("gameWin", Number(e.target.value))
              }
              step={0.5}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Game Loss
            </label>
            <input
              type="number"
              value={settings.scoring.gameLoss}
              onChange={(e) =>
                updateScoringSetting("gameLoss", Number(e.target.value))
              }
              step={0.5}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Can be negative (penalty)
            </p>
          </div>
        </div>
      </div>

      {/* League Configuration */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--accent)",
          }}
        >
          League Configuration
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Max Teams per League
            </label>
            <input
              type="number"
              value={settings.league.maxTeamsPerLeague}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-muted)",
                fontSize: "0.95rem",
                cursor: "not-allowed",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Fixed at 12 managers per league
            </p>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Playoff Teams
            </label>
            <input
              type="number"
              value={settings.league.playoffTeams}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-muted)",
                fontSize: "0.95rem",
                cursor: "not-allowed",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Top 4 teams make playoffs
            </p>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(242, 182, 50, 0.1)", borderRadius: "6px", borderLeft: "3px solid var(--accent)" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "0.5rem", fontWeight: 600 }}>
            Per-League Settings
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Draft type (Snake/Linear), waiver system (FAAB/Rolling/Fixed), and roster structure (positions) are configured individually when creating each fantasy league.
          </p>
        </div>
      </div>

      {/* Waiver Processing Schedule */}
      <div className="card" style={{ padding: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: "var(--accent)",
          }}
        >
          Waiver Processing Schedule
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Default times when waivers are processed automatically
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>
            Processing Times
          </h3>
          <button
            className="btn btn-primary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            onClick={() => {
              const newSchedule = [...settings.waivers.processingSchedule, { day: "Monday", time: "03:00" }];
              setSettings(prev => ({ ...prev, waivers: { ...prev.waivers, processingSchedule: newSchedule } }));
              setHasChanges(true);
            }}
          >
            + Add Time
          </button>
        </div>

        {settings.waivers.processingSchedule.map((schedule, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "200px 150px auto",
              gap: "1rem",
              marginBottom: "1rem",
              alignItems: "end"
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Day
              </label>
              <select
                value={schedule.day}
                onChange={(e) => {
                  const newSchedule = [...settings.waivers.processingSchedule];
                  newSchedule[index].day = e.target.value;
                  setSettings(prev => ({ ...prev, waivers: { ...prev.waivers, processingSchedule: newSchedule } }));
                  setHasChanges(true);
                }}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "var(--text-main)",
                  fontSize: "0.95rem",
                }}
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Time
              </label>
              <input
                type="time"
                value={schedule.time}
                onChange={(e) => {
                  const newSchedule = [...settings.waivers.processingSchedule];
                  newSchedule[index].time = e.target.value;
                  setSettings(prev => ({ ...prev, waivers: { ...prev.waivers, processingSchedule: newSchedule } }));
                  setHasChanges(true);
                }}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "var(--text-main)",
                  fontSize: "0.95rem",
                }}
              />
            </div>

            <button
              className="btn btn-ghost"
              style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}
              onClick={() => {
                const newSchedule = settings.waivers.processingSchedule.filter((_, i) => i !== index);
                setSettings(prev => ({ ...prev, waivers: { ...prev.waivers, processingSchedule: newSchedule } }));
                setHasChanges(true);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Save Button - Sticky */}
      {hasChanges && (
        <div
          style={{
            position: "sticky",
            bottom: "2rem",
            marginTop: "2rem",
            padding: "1rem",
            background: "var(--bg-surface)",
            borderRadius: "8px",
            border: "2px solid var(--accent)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.95rem",
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            Remember to save your changes!
          </span>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn-ghost"
              onClick={resetSettings}
              disabled={isSaving}
            >
              Reset to Defaults
            </button>
            <button
              className="btn btn-primary"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
