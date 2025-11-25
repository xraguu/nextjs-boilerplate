import { prisma } from "../lib/prisma";

/**
 * Generate matchups for a fantasy league
 * Creates 8 weeks of regular season matchups for 12 teams
 * Ensures no team plays the same opponent twice
 */
async function generateMatchups(leagueId: string) {
  try {
    // Get all fantasy teams in the league
    const teams = await prisma.fantasyTeam.findMany({
      where: { fantasyLeagueId: leagueId },
      orderBy: { id: "asc" },
    });

    if (teams.length !== 12) {
      console.error(`Expected 12 teams, found ${teams.length}`);
      return;
    }

    console.log(`Generating matchups for ${teams.length} teams...`);

    // Delete existing matchups
    await prisma.matchup.deleteMany({
      where: { fantasyLeagueId: leagueId },
    });

    // Use circle method (round-robin tournament algorithm) for 8 weeks
    // With 12 teams, we create 6 matchups per week with NO repeats
    // This guarantees each team plays 8 different opponents
    const matchups: Array<{ week: number; homeTeamId: string; awayTeamId: string }> = [];

    // Create rotation array (fix first team, rotate others)
    // This is the classic "polygon method" for round-robin scheduling
    const rotation = teams.map((_, i) => i);

    for (let week = 1; week <= 8; week++) {
      const weekMatchups: Array<{ homeTeamId: string; awayTeamId: string }> = [];

      // Create 6 matchups by pairing teams across the circle
      for (let i = 0; i < 6; i++) {
        const home = rotation[i];
        const away = rotation[11 - i]; // Pair with opposite position

        weekMatchups.push({
          homeTeamId: teams[home].id,
          awayTeamId: teams[away].id,
        });
      }

      // Add to main matchups list
      weekMatchups.forEach((matchup) => {
        matchups.push({ week, ...matchup });
      });

      console.log(`Week ${week}: Generated ${weekMatchups.length} matchups`);

      // Rotate teams for next week (keep position 0 fixed)
      if (week < 8) {
        const last = rotation.pop()!;
        rotation.splice(1, 0, last);
      }
    }

    // Insert matchups into database
    const createMatchups = matchups.map((matchup) =>
      prisma.matchup.create({
        data: {
          fantasyLeagueId: leagueId,
          week: matchup.week,
          homeTeamId: matchup.homeTeamId,
          awayTeamId: matchup.awayTeamId,
          isPlayoff: false,
        },
      })
    );

    await Promise.all(createMatchups);

    console.log(`✅ Successfully created ${matchups.length} matchups across 8 weeks`);

    // Display matchup schedule
    console.log("\n📅 Matchup Schedule:");
    for (let week = 1; week <= 8; week++) {
      const weekMatchups = matchups.filter((m) => m.week === week);
      console.log(`\nWeek ${week}:`);
      weekMatchups.forEach((m) => {
        const homeTeam = teams.find((t) => t.id === m.homeTeamId);
        const awayTeam = teams.find((t) => t.id === m.awayTeamId);
        console.log(`  ${homeTeam?.displayName} vs ${awayTeam?.displayName}`);
      });
    }

  } catch (error) {
    console.error("Error generating matchups:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get league ID from command line or use default
const leagueId = process.argv[2];

if (!leagueId) {
  console.error("Usage: npx tsx scripts/generate-matchups.ts <leagueId>");
  process.exit(1);
}

generateMatchups(leagueId);
