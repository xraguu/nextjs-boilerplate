import { prisma } from "../lib/prisma";

async function checkLeague() {
  try {
    const leagueId = "19Test123-BNL14";

    console.log(`Checking for league: ${leagueId}`);
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        fantasyTeams: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (league) {
      console.log("✅ League found:", league.name);
      console.log(`  ID: ${league.id}`);
      console.log(`  Teams: ${league.fantasyTeams.length}`);
      console.log(`  Current Week: ${league.currentWeek}`);

      if (league.fantasyTeams.length > 0) {
        console.log(`\n  Fantasy Teams:`);
        league.fantasyTeams.forEach((team, index) => {
          console.log(`    ${index + 1}. ${team.displayName} - ${team.owner.displayName} (${team.id})`);
        });
      }

      // Check for existing matchups
      const matchups = await prisma.matchup.findMany({
        where: { fantasyLeagueId: leagueId },
      });
      console.log(`\n  Existing matchups: ${matchups.length}`);

      if (matchups.length > 0) {
        console.log(`\n  Matchups by week:`);
        for (let week = 1; week <= 10; week++) {
          const weekMatchups = matchups.filter((m) => m.week === week);
          if (weekMatchups.length > 0) {
            console.log(`    Week ${week}: ${weekMatchups.length} matchups`);
          }
        }
      }
    } else {
      console.log("❌ League not found");

      // List all leagues
      const allLeagues = await prisma.fantasyLeague.findMany({
        select: {
          id: true,
          name: true,
          season: true,
        },
      });

      console.log("\nAvailable leagues:");
      allLeagues.forEach((l) => {
        console.log(`  - ${l.id} (${l.name}, Season ${l.season})`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLeague();
