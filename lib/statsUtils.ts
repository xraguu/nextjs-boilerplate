import { prisma } from "./prisma";
import { TeamId } from "./teams";

export interface TeamStats {
  teamId: TeamId;
  week: number;
  fpts: number;
  avg: number;
  last: number;
  goals: number;
  shots: number;
  saves: number;
  assists: number;
  demos: number;
  record: string;
  isManualOverride?: boolean; // Flag to indicate if this is from manual override
}

/**
 * Get stats for a specific team and week, prioritizing manual overrides
 * @param teamId - The MLE team ID (e.g., "ALbulls")
 * @param week - The week number (1-14)
 * @param datasetStats - The stats from your dataset/API (fallback if no override exists)
 * @returns TeamStats with manual override if exists, otherwise dataset stats
 */
export async function getTeamStatsForWeek(
  teamId: TeamId,
  week: number,
  datasetStats: Omit<TeamStats, "isManualOverride">
): Promise<TeamStats> {
  try {
    // Check if there's a manual override for this team and week
    const override = await prisma.manualStatsOverride.findUnique({
      where: {
        teamId_week: {
          teamId,
          week,
        },
      },
    });

    // If override exists, return it with flag
    if (override) {
      return {
        teamId: override.teamId as TeamId,
        week: override.week,
        fpts: override.fpts,
        avg: override.avg,
        last: override.last,
        goals: override.goals,
        shots: override.shots,
        saves: override.saves,
        assists: override.assists,
        demos: override.demos,
        record: override.record,
        isManualOverride: true,
      };
    }

    // No override found, return dataset stats
    return {
      ...datasetStats,
      isManualOverride: false,
    };
  } catch (error) {
    console.error(
      `Error fetching stats for ${teamId} week ${week}:`,
      error
    );
    // On error, return dataset stats as fallback
    return {
      ...datasetStats,
      isManualOverride: false,
    };
  }
}

/**
 * Get all manual overrides for a specific week
 * Useful for batch operations or displaying all overrides
 */
export async function getManualOverridesForWeek(
  week: number
): Promise<TeamStats[]> {
  try {
    const overrides = await prisma.manualStatsOverride.findMany({
      where: { week },
      orderBy: { teamId: "asc" },
    });

    return overrides.map((override) => ({
      teamId: override.teamId as TeamId,
      week: override.week,
      fpts: override.fpts,
      avg: override.avg,
      last: override.last,
      goals: override.goals,
      shots: override.shots,
      saves: override.saves,
      assists: override.assists,
      demos: override.demos,
      record: override.record,
      isManualOverride: true,
    }));
  } catch (error) {
    console.error(`Error fetching overrides for week ${week}:`, error);
    return [];
  }
}

/**
 * Check if a manual override exists for a team and week
 */
export async function hasManualOverride(
  teamId: TeamId,
  week: number
): Promise<boolean> {
  try {
    const override = await prisma.manualStatsOverride.findUnique({
      where: {
        teamId_week: {
          teamId,
          week,
        },
      },
    });
    return override !== null;
  } catch (error) {
    console.error(
      `Error checking override for ${teamId} week ${week}:`,
      error
    );
    return false;
  }
}
