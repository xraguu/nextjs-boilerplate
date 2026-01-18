import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking MLE Teams in database...\n");

  const teams = await prisma.mLETeam.findMany({
    take: 10,
    orderBy: { id: 'asc' }
  });

  console.log(`Found ${teams.length} teams (showing first 10):\n`);

  teams.forEach(team => {
    console.log(`ID: ${team.id.padEnd(20)} Name: ${team.name.padEnd(15)} League: ${team.leagueId}`);
  });

  console.log("\n✅ Done!");
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
