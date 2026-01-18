import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * GET /api/leaderboard/global
 * Get top performing fantasy managers across all leagues
 */
export async function GET() {
  try {
    const session = await auth();

    // Get all fantasy teams with their matchups
    const fantasyTeams = await prisma.fantasyTeam.findMany({
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
          },
        },
        homeMatchups: {
          select: {
            id: true,
            week: true,
            homeScore: true,
            awayScore: true,
          },
        },
        awayMatchups: {
          select: {
            id: true,
            week: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    });

    // Calculate stats for each team
    const teamsWithStats = fantasyTeams.map((team) => {
      let wins = 0;
      let losses = 0;
      let totalPoints = 0;
      let gamesPlayed = 0;

      // Process home matchups
      team.homeMatchups.forEach((matchup) => {
        if (matchup.homeScore !== null && matchup.awayScore !== null) {
          totalPoints += matchup.homeScore;
          gamesPlayed++;

          if (matchup.homeScore > matchup.awayScore) {
            wins++;
          } else if (matchup.homeScore < matchup.awayScore) {
            losses++;
          }
        }
      });

      // Process away matchups
      team.awayMatchups.forEach((matchup) => {
        if (matchup.homeScore !== null && matchup.awayScore !== null) {
          totalPoints += matchup.awayScore;
          gamesPlayed++;

          if (matchup.awayScore > matchup.homeScore) {
            wins++;
          } else if (matchup.awayScore < matchup.homeScore) {
            losses++;
          }
        }
      });

      const avgPoints = gamesPlayed > 0 ? totalPoints / gamesPlayed : 0;
      const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

      return {
        manager: team.owner.displayName,
        team: team.displayName,
        league: team.league.name,
        wins,
        losses,
        winRate,
        totalPoints,
        avgPoints,
        gamesPlayed,
        isYou: session?.user?.id === team.ownerUserId,
      };
    });

    // Filter out teams with no games and sort by wins, then by total points
    const topManagers = teamsWithStats
      .filter((team) => team.gamesPlayed > 0)
      .sort((a, b) => {
        if (a.wins !== b.wins) return b.wins - a.wins;
        return b.totalPoints - a.totalPoints;
      })
      .slice(0, 10)
      .map((team, index) => ({
        rank: index + 1,
        ...team,
      }));

    return NextResponse.json({ leaderboard: topManagers });
  } catch (error) {
    console.error("Error fetching global leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch global leaderboard" },
      { status: 500 }
    );
  }
}
