import { prisma } from "../lib/prisma";
import { generateFantasyTeamId } from "../lib/id-generator";
import { randomUUID } from "crypto";

async function createTestLeague() {
  try {
    console.log("Creating test league...");

    // Get the current user (first user in the database)
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("❌ No users found. Please create a user first.");
      return;
    }

    console.log(`Using user: ${user.displayName} (${user.id})`);

    // Create the league
    const league = await prisma.fantasyLeague.create({
      data: {
        id: "2025-gamma",
        name: "2025 Gamma League",
        season: 2025,
        maxTeams: 12,
        currentWeek: 1,
        playoffTeams: 4,
        draftType: "snake",
        waiverSystem: "faab",
        faabBudget: 100,
        rosterConfig: {
          "2s": 2,
          "3s": 2,
          "flx": 1,
          "be": 3,
        },
        createdByUserId: user.id,
      },
    });

    console.log("✅ League created:", league.id);

    // Create a fantasy team for the user
    const teamId = generateFantasyTeamId(league.id, user.id);
    const fantasyTeam = await prisma.fantasyTeam.create({
      data: {
        id: teamId,
        fantasyLeagueId: league.id,
        ownerUserId: user.id,
        displayName: "Test Team Alpha",
        shortCode: "TTA",
        draftPosition: 1,
        faabRemaining: 100,
        waiverPriority: 1,
      },
    });

    console.log("✅ Fantasy team created:", fantasyTeam.id);

    // Create dummy users and fantasy teams
    const otherTeams = [];
    for (let i = 2; i <= 6; i++) {
      // Create a dummy user for each team
      const userId = randomUUID();
      const dummyUser = await prisma.user.create({
        data: {
          id: userId,
          discordId: `dummy-${Date.now()}-${i}`,
          displayName: `Player ${i}`,
          role: "user",
          status: "active",
        },
      });

      const teamId = generateFantasyTeamId(league.id, dummyUser.id);
      const team = await prisma.fantasyTeam.create({
        data: {
          id: teamId,
          fantasyLeagueId: league.id,
          ownerUserId: dummyUser.id,
          displayName: `Team ${String.fromCharCode(64 + i)}`,
          shortCode: `T${String.fromCharCode(64 + i)}`,
          draftPosition: i,
          faabRemaining: 100,
          waiverPriority: i,
        },
      });
      otherTeams.push(team);
    }

    console.log(`✅ Created ${otherTeams.length} additional teams`);

    // Generate draft picks (snake draft, 8 rounds)
    const totalTeams = 6; // Including the user's team
    const totalRounds = 8;
    const allTeams = [fantasyTeam, ...otherTeams];

    console.log("Generating draft picks...");

    for (let round = 1; round <= totalRounds; round++) {
      const isReverseRound = round % 2 === 0; // Snake draft reverses every other round

      for (let pick = 1; pick <= totalTeams; pick++) {
        const teamIndex = isReverseRound ? totalTeams - pick : pick - 1;
        const overallPick = (round - 1) * totalTeams + pick;

        await prisma.draftPick.create({
          data: {
            fantasyLeagueId: league.id,
            round,
            pickNumber: pick,
            overallPick,
            fantasyTeamId: allTeams[teamIndex].id,
            mleTeamId: null, // Unpicked
            pickedAt: null,
          },
        });
      }
    }

    console.log(`✅ Generated ${totalRounds * totalTeams} draft picks`);

    console.log("\n🎉 Test league setup complete!");
    console.log(`   League ID: ${league.id}`);
    console.log(`   Name: ${league.name}`);
    console.log(`   Teams: ${totalTeams}`);
    console.log(`   Draft: ${league.draftType} (${totalRounds} rounds)`);
    console.log(`\nYou can now access the draft at: http://localhost:3000/leagues/${league.id}/draft`);

  } catch (error) {
    console.error("❌ Error creating test league:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestLeague();
