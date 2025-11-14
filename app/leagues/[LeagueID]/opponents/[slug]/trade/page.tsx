"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";

// Mock managers data
const otherManagers = [
  { id: "manager-1", name: "Mike", teamName: "Thunder Strikers", record: "3-0", place: "1st", totalPoints: 612, avgPoints: 204 },
  { id: "manager-2", name: "Sarah", teamName: "Ice Warriors", record: "1-2", place: "7th", totalPoints: 543, avgPoints: 181 },
  { id: "manager-3", name: "Jake", teamName: "Fire Dragons", record: "2-1", place: "4th", totalPoints: 576, avgPoints: 192 },
  { id: "manager-4", name: "Emma", teamName: "Sky Hunters", record: "2-1", place: "5th", totalPoints: 567, avgPoints: 189 },
  { id: "manager-5", name: "Crazy", teamName: "Pixies", record: "0-3", place: "9th", totalPoints: 543, avgPoints: 181 },
  { id: "manager-6", name: "Alex", teamName: "Storm Chasers", record: "2-1", place: "6th", totalPoints: 603, avgPoints: 201 },
  { id: "manager-7", name: "Jordan", teamName: "Lightning Bolts", record: "1-2", place: "8th", totalPoints: 585, avgPoints: 195 },
  { id: "manager-8", name: "Taylor", teamName: "Phoenix Rising", record: "3-0", place: "2nd", totalPoints: 630, avgPoints: 210 },
  { id: "manager-9", name: "Casey", teamName: "Thunder Wolves", record: "0-3", place: "11th", totalPoints: 534, avgPoints: 178 },
  { id: "manager-10", name: "Morgan", teamName: "Ice Breakers", record: "1-2", place: "10th", totalPoints: 555, avgPoints: 185 },
  { id: "manager-11", name: "Riley", teamName: "Fire Hawks", record: "2-1", place: "12th", totalPoints: 549, avgPoints: 183 },
];

// My roster (xenn)
const myRoster = {
  managerName: "xenn",
  teamName: "Fantastic Ballers",
  record: "2-1",
  place: "3rd",
  totalPoints: 543,
  avgPoints: 181,
  teams: [
    { slot: "2s", name: "AL Blizzard", fpts: 679, record: "7-3", rk: 3, logo: TEAMS.find(t => t.name === "Blizzard")?.logoPath || "" },
    { slot: "2s", name: "AL Comets", fpts: 652, record: "6-4", rk: 5, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "3s", name: "AL Blizzard", fpts: 679, record: "7-3", rk: 3, logo: TEAMS.find(t => t.name === "Blizzard")?.logoPath || "" },
    { slot: "3s", name: "AL Comets", fpts: 652, record: "6-4", rk: 4, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "FLX", name: "AL Comets", fpts: 652, record: "6-4", rk: 5, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 6, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 7, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 8, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
  ]
};

// Generate opponent roster
const generateOpponentRoster = () => {
  return [
    { slot: "2s", name: "AL Blizzard", fpts: 679, record: "7-3", rk: 3, logo: TEAMS.find(t => t.name === "Blizzard")?.logoPath || "" },
    { slot: "2s", name: "AL Comets", fpts: 652, record: "6-4", rk: 5, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "3s", name: "AL Blizzard", fpts: 679, record: "7-3", rk: 3, logo: TEAMS.find(t => t.name === "Blizzard")?.logoPath || "" },
    { slot: "3s", name: "AL Comets", fpts: 652, record: "6-4", rk: 4, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "FLX", name: "AL Comets", fpts: 652, record: "6-4", rk: 5, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 6, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 7, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
    { slot: "BE", name: "AL Comets", fpts: 652, record: "6-4", rk: 8, logo: TEAMS.find(t => t.name === "Comets")?.logoPath || "" },
  ];
};

export default function TradePage() {
  const params = useParams();
  const managerId = params.slug as string;

  const [selectedMyTeams, setSelectedMyTeams] = useState<number[]>([]);
  const [selectedOpponentTeams, setSelectedOpponentTeams] = useState<number[]>([]);

  const opponent = otherManagers.find(m => m.id === managerId) || otherManagers[0];
  const opponentRoster = generateOpponentRoster();

  const toggleMyTeam = (index: number) => {
    setSelectedMyTeams(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleOpponentTeam = (index: number) => {
    setSelectedOpponentTeams(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <a
          href="/leagues/2025-alpha/opponents"
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#ffffff",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.9rem",
            marginBottom: "1rem"
          }}
        >
          ← Back to Opponents
        </a>
        <h1 className="page-heading" style={{ color: "#d4af37", fontSize: "2.5rem", margin: 0 }}>Trade</h1>
      </div>

      <section style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        borderRadius: "12px",
        padding: "2rem",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        {/* Team Headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "2rem",
          alignItems: "start",
          marginBottom: "2rem",
          paddingBottom: "2rem",
          borderBottom: "1px solid rgba(255,255,255,0.2)"
        }}>
          {/* My Team */}
          <div>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "0.25rem"
            }}>
              {myRoster.teamName}
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.9rem",
              margin: "0 0 0.5rem 0"
            }}>
              {myRoster.managerName}
            </p>
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.85rem",
              margin: 0
            }}>
              {myRoster.record}  {myRoster.place}
            </p>
            <div style={{
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.7)"
            }}>
              <span style={{ fontWeight: 600 }}>{myRoster.totalPoints} Fantasy Points</span>
              <span style={{ marginLeft: "1rem" }}>{myRoster.avgPoints} Avg Fantasy Points</span>
            </div>
          </div>

          {/* Propose Trade Button */}
          <button
            style={{
              background: "#d4af37",
              border: "none",
              color: "#1a1a2e",
              padding: "0.75rem 2rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              marginTop: "1rem"
            }}
            onClick={() => alert(`Proposing trade:\nYour teams: ${selectedMyTeams.length}\nTheir teams: ${selectedOpponentTeams.length}`)}
          >
            Propose Trade
          </button>

          {/* Opponent Team */}
          <div style={{ textAlign: "right" }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "0.25rem"
            }}>
              {opponent.teamName}
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.9rem",
              margin: "0 0 0.5rem 0"
            }}>
              {opponent.name}
            </p>
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.85rem",
              margin: 0
            }}>
              {opponent.record}  {opponent.place}
            </p>
            <div style={{
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.7)"
            }}>
              <span style={{ fontWeight: 600 }}>{opponent.totalPoints} Fantasy Points</span>
              <span style={{ marginLeft: "1rem" }}>{opponent.avgPoints} Avg Fantasy Points</span>
            </div>
          </div>
        </div>

        {/* Trade Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "2rem",
          alignItems: "start"
        }}>
          {/* My Teams - Left Side */}
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto auto auto",
              gap: "1rem",
              marginBottom: "0.5rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600
            }}>
              <div></div>
              <div>Team</div>
              <div style={{ textAlign: "right" }}>Fpts</div>
              <div style={{ textAlign: "center" }}>Record</div>
              <div style={{ textAlign: "center" }}>Rk</div>
              <div></div>
            </div>

            {myRoster.teams.map((team, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto auto",
                  gap: "1rem",
                  padding: "0.75rem 0",
                  alignItems: "center",
                  borderBottom: team.slot === "FLX" ? "2px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <Image src={team.logo} alt={team.name} width={24} height={24} style={{ borderRadius: "4px" }} />
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ffffff" }}>{team.name}</div>
                <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", textAlign: "right" }}>{team.fpts}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{team.record}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{team.rk}</div>
                <input
                  type="checkbox"
                  checked={selectedMyTeams.includes(idx)}
                  onChange={() => toggleMyTeam(idx)}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    accentColor: "#d4af37"
                  }}
                />
              </div>
            ))}
          </div>

          {/* Position Labels - Middle */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600,
              marginBottom: "1rem",
              textAlign: "center"
            }}>
              Position
            </div>
            {myRoster.teams.map((team, idx) => (
              <div
                key={idx}
                style={{
                  padding: "0.75rem 0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: team.slot === "BE" ? "rgba(255,255,255,0.5)" : "#d4af37",
                  textAlign: "center",
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {team.slot}
              </div>
            ))}
          </div>

          {/* Opponent Teams - Right Side */}
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto auto auto auto 1fr auto",
              gap: "1rem",
              marginBottom: "0.5rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600
            }}>
              <div></div>
              <div style={{ textAlign: "center" }}>Rk</div>
              <div style={{ textAlign: "center" }}>Record</div>
              <div style={{ textAlign: "right" }}>Fpts</div>
              <div>Team</div>
              <div></div>
            </div>

            {opponentRoster.map((team, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto auto auto 1fr auto",
                  gap: "1rem",
                  padding: "0.75rem 0",
                  alignItems: "center",
                  borderBottom: team.slot === "FLX" ? "2px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedOpponentTeams.includes(idx)}
                  onChange={() => toggleOpponentTeam(idx)}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    accentColor: "#d4af37"
                  }}
                />
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{team.rk}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{team.record}</div>
                <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", textAlign: "right" }}>{team.fpts}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ffffff" }}>{team.name}</div>
                <Image src={team.logo} alt={team.name} width={24} height={24} style={{ borderRadius: "4px" }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
