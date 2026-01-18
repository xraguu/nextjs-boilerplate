import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const league = await prisma.fantasyLeague.findUnique({
    where: { id: "2026TestSheet2-JWT61-1" },
    include: {
      fantasyTeams: {
        select: {
          id: true,
          displayName: true,
          roster: {
            where: { week: 1 },
            select: {
              id: true,
              position: true,
              slotIndex: true,
              mleTeamId: true,
            },
          },
        },
      },
    },
  });

  console.log("League:", league?.name);
  console.log("Roster Config:", league?.rosterConfig);
  console.log("\nTeams and their roster slots:");
  league?.fantasyTeams.forEach((team) => {
    console.log(`\n${team.displayName}:`);
    console.log(`  Total slots: ${team.roster.length}`);
    team.roster.forEach((slot) => {
      console.log(`    Position: ${slot.position}, SlotIndex: ${slot.slotIndex}, MLE Team: ${slot.mleTeamId}`);
    });
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
