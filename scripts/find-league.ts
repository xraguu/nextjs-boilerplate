import { prisma } from "../lib/prisma";

async function findLeagues() {
  const leagues = await prisma.fantasyLeague.findMany({
    include: {
      fantasyTeams: {
        include: {
          owner: true
        }
      }
    }
  });

  console.log(`Found ${leagues.length} leagues:\n`);

  for (const league of leagues) {
    console.log(`League: ${league.name} (ID: ${league.id})`);
    console.log(`  Teams: ${league.fantasyTeams.length}`);
    league.fantasyTeams.forEach(team => {
      console.log(`    - ${team.displayName} (${team.owner.displayName})`);
    });
    console.log(`  Roster Config:`, league.rosterConfig);
    console.log();
  }

  await prisma.$disconnect();
}

findLeagues().catch(console.error);
