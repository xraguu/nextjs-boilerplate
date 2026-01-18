import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.fantasyTeam.findMany({
    where: {
      displayName: {
        contains: "Ceiling",
      },
    },
    include: {
      league: {
        select: {
          id: true,
          name: true,
          rosterConfig: true,
        },
      },
      roster: {
        where: { week: 1 },
        select: {
          id: true,
          position: true,
          slotIndex: true,
          mleTeamId: true,
        },
        orderBy: { slotIndex: "asc" },
      },
    },
  });

  console.log("Found teams:\n");
  teams.forEach((team) => {
    console.log(`Team: ${team.displayName}`);
    console.log(`League: ${team.league.name} (ID: ${team.league.id})`);
    console.log(`Roster Config: ${JSON.stringify(team.league.rosterConfig)}`);
    console.log(`Total roster slots for week 1: ${team.roster.length}`);
    console.log("\nRoster slots:");
    team.roster.forEach((slot) => {
      console.log(`  Position: ${slot.position}, SlotIndex: ${slot.slotIndex}, MLE Team: ${slot.mleTeamId}`);
    });
    console.log("\n---\n");
  });
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
