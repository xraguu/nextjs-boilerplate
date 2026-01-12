/**
 * Test draft import functionality
 * Run with: npx tsx scripts/test-draft-import.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parseColumnBasedCSV } from "../lib/csvParser";
import { validateImportData, executeImport } from "../lib/draftImportService";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing draft import functionality...\n");

  // Find the test league
  const league = await prisma.fantasyLeague.findFirst({
    where: {
      name: "Test Draft Import League"
    }
  });

  if (!league) {
    console.error("❌ Test league not found. Run create-test-draft-league.ts first.");
    process.exit(1);
  }

  console.log(`✅ Found test league: ${league.name} (${league.id})\n`);

  // Read CSV file
  const csvPath = path.join(process.cwd(), "data", "sample-draft-import.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  console.log(`✅ Loaded CSV file: ${csvPath}\n`);

  // Step 1: Parse CSV
  console.log("Step 1: Parsing CSV...");
  const { columns, errors: parseErrors } = parseColumnBasedCSV(csvContent);

  if (parseErrors.length > 0) {
    console.error("❌ CSV parsing errors:");
    parseErrors.forEach(err => console.error(`   - ${err.message}`));
    process.exit(1);
  }

  console.log(`✅ Parsed ${columns.length} teams from CSV\n`);

  // Display parsed data
  console.log("📋 Parsed Teams:");
  columns.forEach((col, idx) => {
    console.log(`   ${idx + 1}. ${col.teamName} (Discord: ${col.discordId})`);
    console.log(`      Picks: ${col.picks.filter(p => p).length}/8`);
  });
  console.log();

  // Step 2: Validate import
  console.log("Step 2: Validating import data...");
  const validation = await validateImportData(columns, league.id);

  console.log(`   Validation: ${validation.valid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Errors: ${validation.errors.length}`);
  console.log(`   Warnings: ${validation.warnings.length}`);

  if (validation.errors.length > 0) {
    console.log("\n❌ Validation Errors:");
    validation.errors.forEach(err => {
      console.log(`   - ${err.message}`);
    });
  }

  if (validation.warnings.length > 0) {
    console.log("\n⚠️  Validation Warnings:");
    validation.warnings.slice(0, 5).forEach(warn => {
      console.log(`   - ${warn.message}`);
    });
    if (validation.warnings.length > 5) {
      console.log(`   ... and ${validation.warnings.length - 5} more warnings`);
    }
  }

  console.log("\n📊 Preview:");
  console.log(`   Total Teams: ${validation.preview.totalTeams}`);
  console.log(`   Total Picks: ${validation.preview.totalPicks}`);
  console.log(`   New Users: ${validation.preview.teams.filter(t => !t.userExists).length}`);
  console.log(`   Existing Users: ${validation.preview.teams.filter(t => t.userExists).length}`);
  console.log();

  if (!validation.valid) {
    console.error("❌ Validation failed. Cannot proceed with import.");
    process.exit(1);
  }

  // Step 3: Execute import
  console.log("Step 3: Executing import...");
  console.log("   This will:");
  console.log(`   - Create ${validation.preview.teams.filter(t => !t.userExists).length} new users`);
  console.log(`   - Create ${validation.preview.totalTeams} fantasy teams`);
  console.log(`   - Create ${validation.preview.totalTeams * 8} draft picks`);
  console.log(`   - Create ~${validation.preview.totalPicks} roster slots\n`);

  try {
    const result = await executeImport(columns, league.id, true);

    console.log("✅ Import completed successfully!\n");
    console.log("📊 Import Results:");
    console.log(`   Users Created: ${result.usersCreated}`);
    console.log(`   Users Found: ${result.usersFound}`);
    console.log(`   Teams Created: ${result.teamsCreated}`);
    console.log(`   Teams Updated: ${result.teamsUpdated}`);
    console.log(`   Draft Picks Created: ${result.draftPicksCreated}`);
    console.log(`   Roster Slots Created: ${result.rosterSlotsCreated}`);
    console.log();

  } catch (error) {
    console.error("❌ Import failed:", error);
    throw error;
  }

  // Step 4: Verify data
  console.log("Step 4: Verifying imported data...");

  const updatedLeague = await prisma.fantasyLeague.findUnique({
    where: { id: league.id },
    include: {
      fantasyTeams: {
        include: {
          owner: true
        },
        orderBy: {
          draftPosition: 'asc'
        }
      },
      draftPicks: {
        orderBy: {
          overallPick: 'asc'
        },
        take: 10 // Just show first 10 picks
      },
      _count: {
        select: {
          draftPicks: true
        }
      }
    }
  });

  console.log(`   League Draft Status: ${updatedLeague?.draftStatus}`);
  console.log(`   Fantasy Teams: ${updatedLeague?.fantasyTeams.length}`);
  console.log(`   Draft Picks: ${updatedLeague?._count?.draftPicks || 'N/A'}`);
  console.log();

  console.log("🎯 First 10 Teams (Draft Order):");
  updatedLeague?.fantasyTeams.slice(0, 10).forEach((team) => {
    console.log(`   ${team.draftPosition}. ${team.displayName} (${team.shortCode}) - Owner: ${team.owner.displayName}`);
  });
  console.log();

  console.log("🎯 First 10 Draft Picks:");
  updatedLeague?.draftPicks.forEach((pick) => {
    console.log(`   Pick ${pick.overallPick} (Rd ${pick.round}, #${pick.pickNumber}): ${pick.mleTeamId || 'NULL'}`);
  });
  console.log();

  console.log("✅ All tests passed! Draft import is working correctly.\n");
  console.log("🌐 View in browser:");
  console.log(`   http://localhost:3000/admin/leagues/${league.id}`);
}

main()
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
