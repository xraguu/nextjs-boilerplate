import { prisma } from "../lib/prisma";

async function checkLeagueInfo() {
  try {
    const leagues = await prisma.fantasyLeague.findMany({
      include: {
        fantasyTeams: {
          include: {
            owner: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    console.log(`\n📊 Found ${leagues.length} league(s):\n`);

    for (const league of leagues) {
      console.log(`League: ${league.name}`);
      console.log(`ID: ${league.id}`);
      console.log(`Teams: ${league.fantasyTeams.length}`);
      console.log(`\nTeams in league:`);
      league.fantasyTeams.forEach((team, index) => {
        console.log(`  ${index + 1}. ${team.displayName} - Manager: ${team.owner.displayName}`);
      });

      // Check matchups
      const matchups = await prisma.matchup.findMany({
        where: { fantasyLeagueId: league.id },
      });

      console.log(`\nMatchups: ${matchups.length}`);
      console.log("\n" + "=".repeat(60) + "\n");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLeagueInfo();
