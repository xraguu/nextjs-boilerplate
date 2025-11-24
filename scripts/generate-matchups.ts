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

    // Generate round-robin schedule for 8 weeks
    // With 12 teams, we can create 6 matchups per week (12/2 = 6)
    const matchups: Array<{ week: number; homeTeamId: string; awayTeamId: string }> = [];

    // Track which teams have played each other
    const played = new Map<string, Set<string>>();
    teams.forEach((team) => {
      played.set(team.id, new Set());
    });

    // Generate matchups for 8 weeks
    for (let week = 1; week <= 8; week++) {
      const availableTeams = [...teams];
      const weekMatchups: Array<{ homeTeamId: string; awayTeamId: string }> = [];

      // Try to create 6 matchups for this week
      while (availableTeams.length >= 2 && weekMatchups.length < 6) {
        let matched = false;

        // Try to find two teams that haven't played each other yet
        for (let i = 0; i < availableTeams.length - 1; i++) {
          const team1 = availableTeams[i];

          for (let j = i + 1; j < availableTeams.length; j++) {
            const team2 = availableTeams[j];

            // Check if these teams have already played
            if (!played.get(team1.id)?.has(team2.id)) {
              // Create matchup
              weekMatchups.push({
                homeTeamId: team1.id,
                awayTeamId: team2.id,
              });

              // Mark as played
              played.get(team1.id)?.add(team2.id);
              played.get(team2.id)?.add(team1.id);

              // Remove from available teams
              availableTeams.splice(j, 1);
              availableTeams.splice(i, 1);

              matched = true;
              break;
            }
          }

          if (matched) break;
        }

        // If we couldn't find a fresh matchup, allow repeats for remaining teams
        if (!matched && availableTeams.length >= 2) {
          const team1 = availableTeams[0];
          const team2 = availableTeams[1];

          weekMatchups.push({
            homeTeamId: team1.id,
            awayTeamId: team2.id,
          });

          availableTeams.splice(1, 1);
          availableTeams.splice(0, 1);
        }
      }

      // Add week matchups to the main list
      weekMatchups.forEach((matchup) => {
        matchups.push({
          week,
          ...matchup,
        });
      });

      console.log(`Week ${week}: Generated ${weekMatchups.length} matchups`);
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
