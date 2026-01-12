import { prisma } from "../lib/prisma";
import { generateFantasyTeamId } from "../lib/id-generator";
import { randomUUID } from "crypto";

async function addMoreTeams() {
  try {
    const leagueId = "2025-gamma";

    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        fantasyTeams: true,
        draftPicks: true,
      },
    });

    if (!league) {
      console.error("❌ League not found");
      return;
    }

    const currentTeamCount = league.fantasyTeams.length;
    const targetTeamCount = 12;
    const teamsToAdd = targetTeamCount - currentTeamCount;

    if (teamsToAdd <= 0) {
      console.log("✅ League already has 12 teams");
      return;
    }

    console.log(`Adding ${teamsToAdd} more teams to reach ${targetTeamCount}...`);

    const newTeams = [];
    for (let i = 0; i < teamsToAdd; i++) {
      const teamNum = currentTeamCount + i + 1;

      const userId = randomUUID();
      const dummyUser = await prisma.user.create({
        data: {
          id: userId,
          discordId: `dummy-${Date.now()}-${i}-${Math.random()}`,
          displayName: `Player ${teamNum}`,
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
          displayName: `Team ${String.fromCharCode(64 + teamNum)}`,
          shortCode: `T${String.fromCharCode(64 + teamNum)}`,
          draftPosition: teamNum,
          faabRemaining: 100,
          waiverPriority: teamNum,
        },
      });
      newTeams.push(team);
    }

    console.log(`✅ Added ${teamsToAdd} teams`);

    // Delete existing draft picks
    await prisma.draftPick.deleteMany({
      where: { fantasyLeagueId: leagueId },
    });

    console.log("Regenerating draft picks for 12 teams...");

    // Get all teams
    const allTeams = await prisma.fantasyTeam.findMany({
      where: { fantasyLeagueId: leagueId },
      orderBy: { draftPosition: "asc" },
    });

    const totalRounds = 8;
    for (let round = 1; round <= totalRounds; round++) {
      const isReverseRound = round % 2 === 0;

      for (let pick = 1; pick <= allTeams.length; pick++) {
        const teamIndex = isReverseRound ? allTeams.length - pick : pick - 1;
        const overallPick = (round - 1) * allTeams.length + pick;

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

    console.log(`✅ Generated ${totalRounds * allTeams.length} draft picks`);
    console.log("\n🎉 League now has 12 teams!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreTeams();
