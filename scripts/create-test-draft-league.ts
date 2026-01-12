/**
 * Create a test league for testing draft import
 * Run with: npx tsx scripts/create-test-draft-league.ts
 */

import { PrismaClient } from "@prisma/client";
import { generateFantasyLeagueId } from "../lib/id-generator";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Creating test league for draft import...\n");

  try {
    // 1. Create or find admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: "admin" }
    });

    if (!adminUser) {
      console.log("Creating admin user...");
      const userId = randomUUID();
      adminUser = await prisma.user.create({
        data: {
          id: userId,
          discordId: "999999999999999999",
          displayName: "Admin User",
          role: "admin",
          status: "active"
        }
      });
      console.log(`✅ Created admin user: ${adminUser.displayName} (ID: ${adminUser.id})\n`);
    } else {
      console.log(`✅ Found admin user: ${adminUser.displayName} (ID: ${adminUser.id})\n`);
    }

    // 2. Create test league
    const leagueName = "Test Draft Import League";
    const season = 2025;
    const leagueId = generateFantasyLeagueId(season, leagueName);

    // Check if league already exists
    const existingLeague = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId }
    });

    if (existingLeague) {
      console.log(`⚠️  League already exists: ${existingLeague.name} (${existingLeague.id})`);
      console.log(`   Use this league ID for testing: ${existingLeague.id}\n`);
      return;
    }

    const league = await prisma.fantasyLeague.create({
      data: {
        id: leagueId,
        name: leagueName,
        season,
        maxTeams: 12,
        playoffTeams: 4,
        draftType: "snake",
        waiverSystem: "faab",
        faabBudget: 100,
        rosterConfig: {
          "2s": 2,
          "3s": 2,
          "flx": 1,
          "be": 3
        },
        createdByUserId: adminUser.id,
        draftStatus: "not_started"
      }
    });

    console.log("✅ Created test league:");
    console.log(`   Name: ${league.name}`);
    console.log(`   ID: ${league.id}`);
    console.log(`   Season: ${league.season}`);
    console.log(`   Max Teams: ${league.maxTeams}`);
    console.log(`   Draft Type: ${league.draftType}`);
    console.log(`   Waiver System: ${league.waiverSystem}`);
    console.log(`   Draft Status: ${league.draftStatus}\n`);

    console.log("📋 Next steps:");
    console.log("1. Start the dev server: npm run dev");
    console.log("2. Navigate to: http://localhost:3000/admin/draft-import");
    console.log(`3. Select league: ${league.name}`);
    console.log("4. Upload: data/sample-draft-import.csv");
    console.log("5. Preview and confirm import\n");

    console.log(`League ID for API testing: ${league.id}\n`);

  } catch (error) {
    console.error("❌ Error creating test league:", error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
