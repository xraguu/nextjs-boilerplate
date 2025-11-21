import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixDraftStatus() {
  try {
    console.log("Finding leagues with draft picks but not started...");

    // Find all leagues that have draft picks but status is not set properly
    const leagues = await prisma.fantasyLeague.findMany({
      include: {
        draftPicks: true,
      },
    });

    for (const league of leagues) {
      if (league.draftPicks.length > 0 && (!league.draftStatus || league.draftStatus === "not_started")) {
        console.log(`Updating league: ${league.name} (${league.id})`);

        const pickTimeSeconds = league.draftPickTimeSeconds || 90;
        const firstPickDeadline = new Date(Date.now() + pickTimeSeconds * 1000);

        await prisma.fantasyLeague.update({
          where: { id: league.id },
          data: {
            draftStatus: "in_progress",
            draftPickDeadline: firstPickDeadline,
          },
        });

        console.log(`✅ Updated ${league.name} - Draft status set to 'in_progress'`);
      }
    }

    console.log("\n✅ All leagues updated!");
  } catch (error) {
    console.error("Error fixing draft status:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixDraftStatus();
