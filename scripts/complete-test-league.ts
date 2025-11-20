import { prisma } from "../lib/prisma";

async function completeTestLeague() {
  try {
    const leagueId = "2025-gamma";

    console.log("Checking league setup...");

    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        fantasyTeams: true,
        draftPicks: true,
      },
    });

    if (!league) {
      console.error("❌ League not found. Run create-test-league.ts first.");
      return;
    }

    console.log(`✅ League found: ${league.name}`);
    console.log(`   Current teams: ${league.fantasyTeams.length}`);
    console.log(`   Current draft picks: ${league.draftPicks.length}`);

    // Add more teams if needed
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("❌ No users found");
      return;
    }

    const teamsNeeded = 6 - league.fantasyTeams.length;
    const otherTeams = [];

    if (teamsNeeded > 0) {
      console.log(`Adding ${teamsNeeded} more teams...`);

      for (let i = 0; i < teamsNeeded; i++) {
        const teamNum = league.fantasyTeams.length + i + 1;

        // Create a dummy user
        const dummyUser = await prisma.user.create({
          data: {
            discordId: `dummy-${Date.now()}-${i}-${Math.random()}`,
            displayName: `Player ${teamNum}`,
            role: "user",
            status: "active",
          },
        });

        const team = await prisma.fantasyTeam.create({
          data: {
            fantasyLeagueId: league.id,
            ownerUserId: dummyUser.id,
            displayName: `Team ${String.fromCharCode(64 + teamNum)}`,
            shortCode: `T${String.fromCharCode(64 + teamNum)}`,
            draftPosition: teamNum,
            faabRemaining: 100,
            waiverPriority: teamNum,
          },
        });
        otherTeams.push(team);
      }

      console.log(`✅ Added ${teamsNeeded} teams`);
    }

    // Get all teams
    const allTeams = await prisma.fantasyTeam.findMany({
      where: { fantasyLeagueId: leagueId },
      orderBy: { draftPosition: "asc" },
    });

    // Generate draft picks if not already generated
    if (league.draftPicks.length === 0) {
      console.log("Generating draft picks...");

      const totalTeams = allTeams.length;
      const totalRounds = 8;

      for (let round = 1; round <= totalRounds; round++) {
        const isReverseRound = round % 2 === 0;

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
              mleTeamId: null,
              pickedAt: null,
            },
          });
        }
      }

      console.log(`✅ Generated ${totalRounds * totalTeams} draft picks`);
    } else {
      console.log("✅ Draft picks already exist");
    }

    console.log("\n🎉 League setup complete!");
    console.log(`   League ID: ${league.id}`);
    console.log(`   Name: ${league.name}`);
    console.log(`   Teams: ${allTeams.length}`);
    console.log(`\nYou can now access the draft at: http://localhost:3000/leagues/${league.id}/draft`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

completeTestLeague();
