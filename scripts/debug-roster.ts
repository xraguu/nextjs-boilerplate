import { prisma } from "../lib/prisma";

async function main() {
  console.log("Checking all fantasy teams and their rosters...\n");

  const teams = await prisma.fantasyTeam.findMany({
    include: {
      owner: true,
      roster: {
        include: {
          mleTeam: true
        },
        orderBy: [
          { week: 'asc' },
          { position: 'asc' },
          { slotIndex: 'asc' }
        ]
      }
    }
  });

  console.log(`Found ${teams.length} fantasy teams\n`);

  for (const team of teams) {
    console.log(`\n--- ${team.displayName} (${team.owner.displayName}) ---`);
    console.log(`Team ID: ${team.id}`);
    console.log(`Total roster slots: ${team.roster.length}`);

    // Group by week
    const byWeek = team.roster.reduce((acc, slot) => {
      if (!acc[slot.week]) acc[slot.week] = [];
      acc[slot.week].push(slot);
      return acc;
    }, {} as Record<number, typeof team.roster>);

    Object.entries(byWeek).forEach(([week, slots]) => {
      console.log(`  Week ${week}: ${slots.length} teams rostered`);
      slots.forEach(slot => {
        console.log(`    - ${slot.position} [${slot.slotIndex}]: ${slot.mleTeam.leagueId} ${slot.mleTeam.name}`);
      });
    });

    if (team.roster.length === 0) {
      console.log(`  ⚠️  NO ROSTER SLOTS FOUND`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
