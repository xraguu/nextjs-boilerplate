import { TeamId } from "./teams";

export interface Player {
  id: string;
  name: string;
  teamId: TeamId;
  fpts: number;
  avg: number;
  last: number;
  goals: number;
  shots: number;
  saves: number;
  assists: number;
  demos: number;
  record: string;
}

// Mock player names
const PLAYER_FIRST_NAMES = [
  "Shadow", "Blaze", "Storm", "Thunder", "Lightning", "Frost", "Inferno", "Vortex",
  "Phoenix", "Dragon", "Wolf", "Tiger", "Eagle", "Hawk", "Raven", "Falcon"
];

const PLAYER_LAST_NAMES = [
  "King", "Beast", "Hunter", "Striker", "Master", "Legend", "Pro", "Elite",
  "Ace", "Star", "Champion", "Hero", "Warrior", "Knight", "Guardian", "Titan"
];

// Generate 3 random players for each team
function generatePlayersForTeam(teamId: TeamId): Player[] {
  const players: Player[] = [];
  for (let i = 0; i < 3; i++) {
    const firstName = PLAYER_FIRST_NAMES[Math.floor(Math.random() * PLAYER_FIRST_NAMES.length)];
    const lastName = PLAYER_LAST_NAMES[Math.floor(Math.random() * PLAYER_LAST_NAMES.length)];

    // Generate random stats
    const fpts = Math.floor(Math.random() * 100) + 400;
    const avg = Math.floor(Math.random() * 30) + 40;
    const last = Math.floor(Math.random() * 30) + 40;
    const goals = Math.floor(Math.random() * 20) + 5;
    const shots = Math.floor(Math.random() * 100) + 50;
    const saves = Math.floor(Math.random() * 100) + 50;
    const assists = Math.floor(Math.random() * 30) + 10;
    const demos = Math.floor(Math.random() * 20) + 5;
    const wins = Math.floor(Math.random() * 8) + 2;
    const losses = 10 - wins;

    players.push({
      id: `${teamId}-player-${i + 1}`,
      name: `${firstName}${lastName}`,
      teamId,
      fpts,
      avg,
      last,
      goals,
      shots,
      saves,
      assists,
      demos,
      record: `${wins}-${losses}`
    });
  }
  return players;
}

// Cache for generated players
const playersCache: Map<TeamId, Player[]> = new Map();

export function getPlayersByTeamId(teamId: TeamId): Player[] {
  if (!playersCache.has(teamId)) {
    playersCache.set(teamId, generatePlayersForTeam(teamId));
  }
  return playersCache.get(teamId)!;
}
