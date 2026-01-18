/**
 * Fantasy League Schedule Generator
 *
 * Generates schedules for fantasy leagues:
 * - Weeks 1-8: Round-robin regular season
 * - Week 9: Playoff quarterfinals (top 8 teams)
 * - Week 10: Playoff semifinals (top 4 teams from week 9)
 */

export interface ScheduleMatchup {
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  isPlayoff: boolean;
}

/**
 * Generate round-robin schedule for regular season (weeks 1-8)
 * Uses the circle method for balanced scheduling
 *
 * @param teamIds - Array of fantasy team IDs (should be even number)
 * @param numWeeks - Number of weeks for regular season (default: 8)
 * @returns Array of matchups
 */
export function generateRoundRobinSchedule(
  teamIds: string[],
  numWeeks: number = 8
): ScheduleMatchup[] {
  const matchups: ScheduleMatchup[] = [];
  const numTeams = teamIds.length;

  if (numTeams < 2) {
    throw new Error("Need at least 2 teams to generate a schedule");
  }

  // If odd number of teams, add a "bye" placeholder
  const teams = [...teamIds];
  const hasBye = numTeams % 2 !== 0;
  if (hasBye) {
    teams.push("BYE");
  }

  const totalTeams = teams.length;
  const matchupsPerWeek = totalTeams / 2;

  // Round-robin algorithm (circle method)
  // Fix first team in position, rotate others
  for (let week = 0; week < numWeeks; week++) {
    const weekMatchups: ScheduleMatchup[] = [];

    // Generate matchups for this week
    for (let match = 0; match < matchupsPerWeek; match++) {
      let home: number, away: number;

      if (match === 0) {
        // First matchup: position 0 vs last position
        home = 0;
        away = totalTeams - 1;
      } else {
        // Other matchups: mirror around the middle
        home = match;
        away = totalTeams - 1 - match;
      }

      const homeTeam = teams[home];
      const awayTeam = teams[away];

      // Skip if either team is a BYE
      if (homeTeam !== "BYE" && awayTeam !== "BYE") {
        // Alternate home/away based on week to balance home field advantage
        if (week % 2 === 0) {
          weekMatchups.push({
            week: week + 1,
            homeTeamId: homeTeam,
            awayTeamId: awayTeam,
            isPlayoff: false,
          });
        } else {
          // Swap home/away on odd weeks
          weekMatchups.push({
            week: week + 1,
            homeTeamId: awayTeam,
            awayTeamId: homeTeam,
            isPlayoff: false,
          });
        }
      }
    }

    matchups.push(...weekMatchups);

    // Rotate teams (keep first team fixed, rotate rest clockwise)
    if (week < numWeeks - 1) {
      const lastTeam = teams.pop()!;
      teams.splice(1, 0, lastTeam);
    }
  }

  return matchups;
}

/**
 * Generate playoff bracket for week 9 (quarterfinals)
 * Top 8 teams based on standings
 *
 * Seeding:
 * - 1 vs 8
 * - 2 vs 7
 * - 3 vs 6
 * - 4 vs 5
 *
 * @param topTeamIds - Array of top 8 team IDs (ordered by rank)
 * @returns Array of week 9 playoff matchups
 */
export function generatePlayoffQuarterfinals(topTeamIds: string[]): ScheduleMatchup[] {
  if (topTeamIds.length < 8) {
    throw new Error("Need at least 8 teams for playoff quarterfinals");
  }

  const matchups: ScheduleMatchup[] = [
    {
      week: 9,
      homeTeamId: topTeamIds[0], // 1 seed
      awayTeamId: topTeamIds[7], // 8 seed
      isPlayoff: true,
    },
    {
      week: 9,
      homeTeamId: topTeamIds[1], // 2 seed
      awayTeamId: topTeamIds[6], // 7 seed
      isPlayoff: true,
    },
    {
      week: 9,
      homeTeamId: topTeamIds[2], // 3 seed
      awayTeamId: topTeamIds[5], // 6 seed
      isPlayoff: true,
    },
    {
      week: 9,
      homeTeamId: topTeamIds[3], // 4 seed
      awayTeamId: topTeamIds[4], // 5 seed
      isPlayoff: true,
    },
  ];

  return matchups;
}

/**
 * Generate playoff semifinals for week 10
 * This can only be done after week 9 results are known
 *
 * Bracket structure:
 * - Winner of (1v8) vs Winner of (4v5)
 * - Winner of (2v7) vs Winner of (3v6)
 *
 * @param week9Winners - Array of 4 team IDs that won in week 9 (in bracket order)
 * @returns Array of week 10 playoff matchups
 */
export function generatePlayoffSemifinals(week9Winners: string[]): ScheduleMatchup[] {
  if (week9Winners.length !== 4) {
    throw new Error("Need exactly 4 teams for playoff semifinals");
  }

  const matchups: ScheduleMatchup[] = [
    {
      week: 10,
      homeTeamId: week9Winners[0], // Winner of 1v8
      awayTeamId: week9Winners[3], // Winner of 4v5
      isPlayoff: true,
    },
    {
      week: 10,
      homeTeamId: week9Winners[1], // Winner of 2v7
      awayTeamId: week9Winners[2], // Winner of 3v6
      isPlayoff: true,
    },
  ];

  return matchups;
}

/**
 * Generate complete regular season schedule (weeks 1-8)
 *
 * @param teamIds - Array of fantasy team IDs
 * @returns Array of all regular season matchups
 */
export function generateRegularSeasonSchedule(teamIds: string[]): ScheduleMatchup[] {
  return generateRoundRobinSchedule(teamIds, 8);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * Used to randomize team order before generating schedule
 */
export function shuffleTeams(teamIds: string[]): string[] {
  const shuffled = [...teamIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
