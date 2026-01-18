import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/teams/top
 * Get top performing MLE teams with their stats
 */
export async function GET() {
  try {
    // Get all teams with their weekly stats
    const teams = await prisma.mLETeam.findMany({
      include: {
        weeklyStats: {
          orderBy: { week: "desc" },
          take: 1, // Get latest week stats
        },
      },
    });

    // Transform the data to include stats and calculate totals
    const teamsWithStats = teams
      .map((team) => {
        const latestStats = team.weeklyStats[0];

        if (!latestStats) {
          return null; // Skip teams without stats
        }

        // Calculate fantasy points based on sprocket rating
        const fpts = latestStats.sprocketRating || 0;
        const avg = latestStats.sprocketRating || 0;

        return {
          id: team.id,
          name: team.name,
          leagueId: team.leagueId,
          slug: team.slug,
          logoPath: team.logoPath,
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
          goals: latestStats.goals,
          shots: latestStats.shots,
          saves: latestStats.saves,
          assists: latestStats.assists,
          demos: latestStats.demosInflicted,
          fpts: Math.round(fpts),
          avg: Math.round(avg),
          last: Math.round(latestStats.sprocketRating || 0),
          score: Math.round(latestStats.sprocketRating || 0),
          week: latestStats.week,
          sprocketRating: latestStats.sprocketRating,
        };
      })
      .filter((team) => team !== null); // Remove teams without stats

    // Sort by sprocket rating (highest first) and take top 10
    const topTeams = teamsWithStats
      .sort((a, b) => (b?.sprocketRating || 0) - (a?.sprocketRating || 0))
      .slice(0, 10)
      .map((team, index) => ({
        ...team,
        rank: index + 1,
      }));

    return NextResponse.json({ teams: topTeams });
  } catch (error) {
    console.error("Error fetching top teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch top teams" },
      { status: 500 }
    );
  }
}
