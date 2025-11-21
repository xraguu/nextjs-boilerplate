import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAllLeagues() {
  try {
    console.log("Starting to delete all fantasy leagues...");

    // Delete in order due to foreign key constraints
    console.log("Deleting matchups...");
    await prisma.matchup.deleteMany({});

    console.log("Deleting waiver claims...");
    await prisma.waiverClaim.deleteMany({});

    console.log("Deleting trades...");
    await prisma.trade.deleteMany({});

    console.log("Deleting roster slots...");
    await prisma.rosterSlot.deleteMany({});

    console.log("Deleting draft picks...");
    await prisma.draftPick.deleteMany({});

    console.log("Deleting fantasy teams...");
    await prisma.fantasyTeam.deleteMany({});

    console.log("Deleting fantasy leagues...");
    const result = await prisma.fantasyLeague.deleteMany({});

    console.log(`✅ Successfully deleted ${result.count} fantasy leagues and all related data.`);
    console.log("Database is now clean and ready for fresh league creation!");
  } catch (error) {
    console.error("Error deleting leagues:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllLeagues();
