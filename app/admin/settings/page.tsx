"use client";

import { useState } from "react";

// Mock system settings
const defaultSettings = {
  season: {
    currentYear: 2025,
    currentWeek: 3,
    startDate: "2025-09-01",
    endDate: "2026-03-31",
    playoffStartWeek: 12,
    lockDeadline: "18:00",
  },
  scoring: {
    winPoints: 10,
    goalPoints: 2,
    savePoints: 1,
    assistPoints: 1.5,
    rosterSize: 8,
    benchSize: 3,
  },
  waivers: {
    processingSchedule: [
      { day: "Wednesday", time: "03:00" },
      { day: "Sunday", time: "03:00" }
    ],
    type: "rolling",
    faabBudget: 100,
  },
  leagues: {
    maxFantasyLeagues: 10,
    maxTeamsPerLeague: 12,
    allowTrades: true,
    tradeDeadlineWeek: 10,
    playoffTeams: 6,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (section: keyof typeof settings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    alert("Settings saved successfully!");
    setHasChanges(false);
  };

  const resetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      setSettings(defaultSettings);
      setHasChanges(false);
      alert("Settings reset to defaults!");
    }
  };

  return (
    <div>
      {/* Save/Reset Buttons */}
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
            >
              Reset to Defaults
            </button>
            <button
              className="btn btn-primary"
              onClick={saveSettings}
            >
              Save Changes
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
                updateSetting("season", "currentYear", Number(e.target.value))
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
                updateSetting("season", "currentWeek", Number(e.target.value))
              }
              min={1}
              max={14}
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
              Season Start Date
            </label>
            <input
              type="date"
              value={settings.season.startDate}
              onChange={(e) =>
                updateSetting("season", "startDate", e.target.value)
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
              Season End Date
            </label>
            <input
              type="date"
              value={settings.season.endDate}
              onChange={(e) =>
                updateSetting("season", "endDate", e.target.value)
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
              Playoff Start Week
            </label>
            <input
              type="number"
              value={settings.season.playoffStartWeek}
              onChange={(e) =>
                updateSetting("season", "playoffStartWeek", Number(e.target.value))
              }
              min={1}
              max={14}
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
              Lineup Lock Deadline (24h format)
            </label>
            <input
              type="time"
              value={settings.season.lockDeadline}
              onChange={(e) =>
                updateSetting("season", "lockDeadline", e.target.value)
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
        </div>
      </div>

      {/* Scoring Rules */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--accent)",
          }}
        >
          Scoring Rules
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
              Points per Win
            </label>
            <input
              type="number"
              value={settings.scoring.winPoints}
              onChange={(e) =>
                updateSetting("scoring", "winPoints", Number(e.target.value))
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
              Points per Goal
            </label>
            <input
              type="number"
              value={settings.scoring.goalPoints}
              onChange={(e) =>
                updateSetting("scoring", "goalPoints", Number(e.target.value))
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
              Points per Save
            </label>
            <input
              type="number"
              value={settings.scoring.savePoints}
              onChange={(e) =>
                updateSetting("scoring", "savePoints", Number(e.target.value))
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
              Points per Assist
            </label>
            <input
              type="number"
              value={settings.scoring.assistPoints}
              onChange={(e) =>
                updateSetting("scoring", "assistPoints", Number(e.target.value))
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
              Roster Size
            </label>
            <input
              type="number"
              value={settings.scoring.rosterSize}
              onChange={(e) =>
                updateSetting("scoring", "rosterSize", Number(e.target.value))
              }
              min={5}
              max={15}
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
              Bench Size
            </label>
            <input
              type="number"
              value={settings.scoring.benchSize}
              onChange={(e) =>
                updateSetting("scoring", "benchSize", Number(e.target.value))
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
        </div>
      </div>

      {/* Waiver Settings */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--accent)",
          }}
        >
          Waiver Settings
        </h2>

        {/* Waiver Processing Schedule */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>
              Processing Schedule
            </h3>
            <button
              className="btn btn-primary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              onClick={() => {
                const newSchedule = [...settings.waivers.processingSchedule, { day: "Monday", time: "03:00" }];
                updateSetting("waivers", "processingSchedule", newSchedule);
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
                    updateSetting("waivers", "processingSchedule", newSchedule);
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
                    updateSetting("waivers", "processingSchedule", newSchedule);
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
                  updateSetting("waivers", "processingSchedule", newSchedule);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

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
              Waiver Type
            </label>
            <select
              value={settings.waivers.type}
              onChange={(e) =>
                updateSetting("waivers", "type", e.target.value)
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
            >
              <option value="rolling">Rolling Waivers</option>
              <option value="faab">FAAB (Free Agent Acquisition Budget)</option>
            </select>
          </div>

          {settings.waivers.type === "faab" && (
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
                FAAB Budget
              </label>
              <input
                type="number"
                value={settings.waivers.faabBudget}
                onChange={(e) =>
                  updateSetting("waivers", "faabBudget", Number(e.target.value))
                }
                min={0}
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
          )}
        </div>
      </div>

      {/* League Settings */}
      <div className="card" style={{ padding: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--accent)",
          }}
        >
          League Settings
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
              Max Fantasy Leagues
            </label>
            <input
              type="number"
              value={settings.leagues.maxFantasyLeagues}
              onChange={(e) =>
                updateSetting("leagues", "maxFantasyLeagues", Number(e.target.value))
              }
              min={1}
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
              Max Teams per League
            </label>
            <input
              type="number"
              value={settings.leagues.maxTeamsPerLeague}
              onChange={(e) =>
                updateSetting("leagues", "maxTeamsPerLeague", Number(e.target.value))
              }
              min={2}
              max={20}
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
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={settings.leagues.allowTrades}
                onChange={(e) =>
                  updateSetting("leagues", "allowTrades", e.target.checked)
                }
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              />
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Allow Trades
              </span>
            </label>
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
              Trade Deadline Week
            </label>
            <input
              type="number"
              value={settings.leagues.tradeDeadlineWeek}
              onChange={(e) =>
                updateSetting("leagues", "tradeDeadlineWeek", Number(e.target.value))
              }
              min={1}
              max={14}
              disabled={!settings.leagues.allowTrades}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                opacity: settings.leagues.allowTrades ? 1 : 0.5,
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
              Playoff Teams
            </label>
            <input
              type="number"
              value={settings.leagues.playoffTeams}
              onChange={(e) =>
                updateSetting("leagues", "playoffTeams", Number(e.target.value))
              }
              min={2}
              max={8}
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
        </div>
      </div>

      {/* Bottom Save Button */}
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
            >
              Reset to Defaults
            </button>
            <button
              className="btn btn-primary"
              onClick={saveSettings}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
