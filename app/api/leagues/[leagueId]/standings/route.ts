import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leagues/[leagueId]/standings
 * Get league standings with fantasy team stats
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId } = await params;

    // Get the league
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      select: {
        id: true,
        name: true,
        currentWeek: true,
      },
    });

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    // Get all fantasy teams in the league
    const fantasyTeams = await prisma.fantasyTeam.findMany({
      where: { fantasyLeagueId: leagueId },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    // Get all matchups for the league
    const matchups = await prisma.matchup.findMany({
      where: { fantasyLeagueId: leagueId },
    });

    // Calculate standings for each team
    const standings = await Promise.all(
      fantasyTeams.map(async (team) => {
        // Calculate wins, losses, points from matchups
        let wins = 0;
        let losses = 0;
        let totalPoints = 0;
        let pointsAgainst = 0;
        const gameResults: ("W" | "L")[] = [];

        matchups.forEach((matchup) => {
          if (!matchup.homeScore || !matchup.awayScore) return;

          const isHome = matchup.homeTeamId === team.id;
          const isAway = matchup.awayTeamId === team.id;

          if (!isHome && !isAway) return;

          const myScore = isHome ? matchup.homeScore : matchup.awayScore;
          const oppScore = isHome ? matchup.awayScore : matchup.homeScore;

          totalPoints += myScore;
          pointsAgainst += oppScore;

          if (myScore > oppScore) {
            wins++;
            gameResults.push("W");
          } else if (myScore < oppScore) {
            losses++;
            gameResults.push("L");
          }
        });

        const gamesPlayed = wins + losses;
        const avgPoints = gamesPlayed > 0 ? totalPoints / gamesPlayed : 0;

        // Calculate streak (looking at last 5 games)
        const recentGames = gameResults.slice(-5);
        let streak = 0;
        let streakType = recentGames[recentGames.length - 1] || "L";

        for (let i = recentGames.length - 1; i >= 0; i--) {
          if (recentGames[i] === streakType) {
            streak++;
          } else {
            break;
          }
        }

        const streakString = `${streakType}${streak}`;

        // Get roster slots to find top performing team
        const rosterSlots = await prisma.rosterSlot.findMany({
          where: {
            fantasyTeamId: team.id,
          },
          include: {
            mleTeam: {
              include: {
                weeklyStats: true,
              },
            },
          },
          distinct: ["mleTeamId"],
        });

        // Calculate fantasy points for each MLE team
        const calculateFantasyPoints = (stats: any) => {
          return (
            stats.goals * 2 +
            stats.shots * 0.1 +
            stats.saves * 1 +
            stats.assists * 1.5 +
            stats.demosInflicted * 0.5
          );
        };

        let topTeam: typeof rosterSlots[0]["mleTeam"] | null = null;
        let topTeamFpts = 0;

        rosterSlots.forEach((slot) => {
          const weeklyStats = slot.mleTeam.weeklyStats;
          const totalFantasyPoints = weeklyStats.reduce(
            (sum, stats) => sum + calculateFantasyPoints(stats),
            0
          );

          if (totalFantasyPoints > topTeamFpts) {
            topTeamFpts = totalFantasyPoints;
            topTeam = slot.mleTeam;
          }
        });

        return {
          fantasyTeamId: team.id,
          manager: team.owner.displayName,
          team: team.displayName,
          wins,
          losses,
          points: totalPoints,
          avgPoints,
          topTeam: topTeam
            ? {
                id: topTeam!.id,
                name: topTeam!.name,
                leagueId: topTeam!.leagueId,
                slug: topTeam!.slug,
                logoPath: topTeam!.logoPath,
                primaryColor: topTeam!.primaryColor,
                secondaryColor: topTeam!.secondaryColor,
              }
            : null,
          topTeamFpts,
          pointsFor: totalPoints,
          pointsAgainst,
          streak: streakString,
          isYou: team.ownerUserId === session.user.id,
        };
      })
    );

    // Sort standings by wins (desc), then by points (desc)
    standings.sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins;
      return b.points - a.points;
    });

    // Add rank
    const standingsWithRank = standings.map((team, index) => ({
      rank: index + 1,
      ...team,
    }));

    return NextResponse.json({
      standings: standingsWithRank,
      league: {
        id: league.id,
        name: league.name,
        currentWeek: league.currentWeek,
      },
    });
  } catch (error) {
    console.error("Error fetching standings:", error);
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
