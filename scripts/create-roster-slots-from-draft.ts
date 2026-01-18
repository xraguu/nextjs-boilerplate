/**
 * Create roster slots for week 1 from draft picks
 * This will create bench slots for all drafted teams
 * Run with: npx tsx scripts/create-roster-slots-from-draft.ts [leagueId]
 */

import { PrismaClient } from "@prisma/client";
import { generateRosterSlotId } from "../lib/id-generator";

const prisma = new PrismaClient();

async function main() {
  const leagueId = process.argv[2];

  if (!leagueId) {
    console.error("❌ Please provide a league ID");
    console.log("Usage: npx tsx scripts/create-roster-slots-from-draft.ts [leagueId]");
    process.exit(1);
  }

  console.log(`🔧 Creating roster slots from draft picks for league: ${leagueId}\n`);

  // Fetch the league
  const league = await prisma.fantasyLeague.findUnique({
    where: { id: leagueId },
    include: {
      fantasyTeams: {
        orderBy: { draftPosition: 'asc' }
      },
      draftPicks: {
        orderBy: { overallPick: 'asc' }
      }
    }
  });

  if (!league) {
    console.error(`❌ League "${leagueId}" not found`);
    process.exit(1);
  }

  console.log(`✅ Found league: ${league.name}`);
  console.log(`   Teams: ${league.fantasyTeams.length}`);
  console.log(`   Draft Picks: ${league.draftPicks.length}\n`);

  let slotsCreated = 0;
  let slotsSkipped = 0;
  let slotsAlreadyExist = 0;

  // Group draft picks by fantasy team
  const picksByTeam = new Map<string, typeof league.draftPicks>();

  for (const pick of league.draftPicks) {
    if (!pick.fantasyTeamId || !pick.mleTeamId) continue;

    if (!picksByTeam.has(pick.fantasyTeamId)) {
      picksByTeam.set(pick.fantasyTeamId, []);
    }
    picksByTeam.get(pick.fantasyTeamId)!.push(pick);
  }

  console.log("Creating roster slots for week 1...\n");

  // Create roster slots for each team
  for (const team of league.fantasyTeams) {
    const teamPicks = picksByTeam.get(team.id) || [];
    console.log(`${team.draftPosition}. ${team.displayName} (${teamPicks.length} picks)`);

    // Sort picks by round
    const sortedPicks = teamPicks.sort((a, b) => a.round - b.round);

    for (let i = 0; i < sortedPicks.length; i++) {
      const pick = sortedPicks[i];

      if (!pick.mleTeamId) {
        console.log(`   ⚠️  Round ${pick.round}: No MLE team selected`);
        slotsSkipped++;
        continue;
      }

      // Check if MLE team exists in database
      const mleTeam = await prisma.mLETeam.findUnique({
        where: { id: pick.mleTeamId }
      });

      if (!mleTeam) {
        console.log(`   ⚠️  Round ${pick.round}: MLE team ${pick.mleTeamId} not found in database`);
        slotsSkipped++;
        continue;
      }

      // Check if roster slot already exists
      const existingSlot = await prisma.rosterSlot.findFirst({
        where: {
          fantasyTeamId: team.id,
          mleTeamId: pick.mleTeamId,
          week: 1
        }
      });

      if (existingSlot) {
        console.log(`   ✓ Round ${pick.round}: ${mleTeam.name} (${mleTeam.leagueId}) - already exists`);
        slotsAlreadyExist++;
        continue;
      }

      // Create roster slot
      try {
        await prisma.rosterSlot.create({
          data: {
            id: generateRosterSlotId(team.id, 1, 'be', i),
            fantasyTeamId: team.id,
            mleTeamId: pick.mleTeamId,
            week: 1,
            position: 'be', // bench
            slotIndex: i,
            isLocked: false
          }
        });

        console.log(`   ✅ Round ${pick.round}: ${mleTeam.name} (${mleTeam.leagueId}) - created`);
        slotsCreated++;
      } catch (error) {
        console.log(`   ❌ Round ${pick.round}: ${mleTeam.name} - error:`, error instanceof Error ? error.message : 'Unknown error');
        slotsSkipped++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Slots Created: ${slotsCreated}`);
  console.log(`   Already Existed: ${slotsAlreadyExist}`);
  console.log(`   Skipped: ${slotsSkipped}`);
  console.log(`\n✅ Done!`);
}

main()
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
