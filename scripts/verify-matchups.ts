import { prisma } from "../lib/prisma";

async function verifyMatchups(leagueId: string) {
  try {
    const matchups = await prisma.matchup.findMany({
      where: { fantasyLeagueId: leagueId },
      include: {
        homeTeam: {
          include: {
            owner: {
              select: {
                displayName: true,
              },
            },
          },
        },
        awayTeam: {
          include: {
            owner: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        week: "asc",
      },
    });

    console.log(`\n📅 Total Matchups: ${matchups.length}\n`);

    // Check for repeat matchups
    const pairings = new Map<string, number[]>();

    matchups.forEach((matchup) => {
      const pair = [matchup.homeTeamId, matchup.awayTeamId].sort().join("-");
      if (!pairings.has(pair)) {
        pairings.set(pair, []);
      }
      pairings.get(pair)!.push(matchup.week);
    });

    // Find repeats
    const repeats: Array<{ pair: string; weeks: number[] }> = [];
    pairings.forEach((weeks, pair) => {
      if (weeks.length > 1) {
        repeats.push({ pair, weeks });
      }
    });

    if (repeats.length > 0) {
      console.log(`\n⚠️  Found ${repeats.length} repeated matchups:\n`);
      repeats.forEach(({ pair, weeks }) => {
        const [team1Id, team2Id] = pair.split("-");
        const matchup = matchups.find(
          (m) =>
            (m.homeTeamId === team1Id && m.awayTeamId === team2Id) ||
            (m.homeTeamId === team2Id && m.awayTeamId === team1Id)
        );
        if (matchup) {
          console.log(
            `  ${matchup.homeTeam.displayName} vs ${matchup.awayTeam.displayName}: Weeks ${weeks.join(", ")}`
          );
        }
      });
    } else {
      console.log(`✅ No repeated matchups found!\n`);
    }

    // Display schedule by week
    console.log(`\n📊 Matchup Schedule:\n`);
    for (let week = 1; week <= 8; week++) {
      const weekMatchups = matchups.filter((m) => m.week === week);
      console.log(`Week ${week} (${weekMatchups.length} matchups):`);
      weekMatchups.forEach((m) => {
        console.log(
          `  ${m.homeTeam.displayName} (${m.homeTeam.owner.displayName}) vs ${m.awayTeam.displayName} (${m.awayTeam.owner.displayName})`
        );
      });
      console.log("");
    }

    // Count games per team
    const teamGames = new Map<string, number>();
    matchups.forEach((m) => {
      teamGames.set(m.homeTeamId, (teamGames.get(m.homeTeamId) || 0) + 1);
      teamGames.set(m.awayTeamId, (teamGames.get(m.awayTeamId) || 0) + 1);
    });

    console.log(`\n📈 Games per team:\n`);
    const teams = await prisma.fantasyTeam.findMany({
      where: { fantasyLeagueId: leagueId },
      include: {
        owner: {
          select: {
            displayName: true,
          },
        },
      },
    });

    teams.forEach((team) => {
      const games = teamGames.get(team.id) || 0;
      console.log(`  ${team.displayName} (${team.owner.displayName}): ${games} games`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

const leagueId = process.argv[2];

if (!leagueId) {
  console.error("Usage: npx tsx scripts/verify-matchups.ts <leagueId>");
  process.exit(1);
}

verifyMatchups(leagueId);
