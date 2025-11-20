import { prisma } from "../lib/prisma";

async function checkLeague() {
  try {
    const leagueId = "2025-gamma";

    console.log(`Checking for league: ${leagueId}`);
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
    });

    if (league) {
      console.log("✅ League found:", league);
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
