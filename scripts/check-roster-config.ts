import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const league = await prisma.fantasyLeague.findUnique({
    where: { id: "2026TestSheet2-JWT61-1" },
    select: {
      rosterConfig: true,
      fantasyTeams: {
        where: { displayName: "Ceiling Shot Squad" },
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
            orderBy: { slotIndex: "asc" },
          },
        },
      },
    },
  });

  console.log("League Roster Config:", JSON.stringify(league?.rosterConfig, null, 2));
  console.log("\nCeiling Shot Squad Roster Slots:");
  league?.fantasyTeams[0]?.roster.forEach((slot) => {
    console.log(`  Position: ${slot.position}, SlotIndex: ${slot.slotIndex}, MLE Team: ${slot.mleTeamId}`);
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
