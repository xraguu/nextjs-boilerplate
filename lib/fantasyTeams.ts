import type { TeamId } from "./teams";

export interface FantasyTeam {
  id: string; // UUID or "lgAlpha-nick"
  fantasyLeagueId: string;
  ownerUserId: string; // User.id (Discord user)
  displayName: string; // e.g. "Nick’s Bumps"
  shortCode: string; // "NCK" or something
  createdAt: Date;
}
