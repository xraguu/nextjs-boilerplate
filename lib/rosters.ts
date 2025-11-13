// lib/rosters.ts
import type { TeamId } from "./teams";

export interface RosterSlot {
  id: string;
  fantasyTeamId: string; // which fantasy team this slot belongs to
  week: number; // fantasy week
  slotIndex: number; // 0–7 (max 8 teams)
  mleTeamId: TeamId; // "ALBulls" etc.
  isStarter: boolean;
  locked: boolean; // after lock time
}
