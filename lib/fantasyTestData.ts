import type { FantasyLeague } from "./fantasyLeagues";
import type { FantasyTeam } from "./fantasyTeams";

export const TEST_LEAGUE: FantasyLeague = {
  id: "test-2025",
  name: "Test RL Fantasy League 2025",
  season: 2025,
  maxTeams: 12,
  createdAt: new Date(),
  createdByUserId: "dev-user",
};

export const TEST_FANTASY_TEAMS: FantasyTeam[] = [
  {
    id: "test-2025-nick",
    fantasyLeagueId: "test-2025",
    ownerUserId: "user-nick",
    displayName: "Nick",
    shortCode: "NCK",
    createdAt: new Date(),
  },
  {
    id: "test-2025-rover",
    fantasyLeagueId: "test-2025",
    ownerUserId: "user-rover",
    displayName: "Rover",
    shortCode: "ROV",
    createdAt: new Date(),
  },
  // ...
];
