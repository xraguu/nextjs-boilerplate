import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/teams/[teamId]/staff
 * Get franchise manager, general manager, and captain for a specific MLE team
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    // Find the team first to ensure it exists and get its name
    const team = await prisma.mLETeam.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        leagueId: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // The team name is already the franchise name (e.g., "Bulls", "Aviators")
    // No need to extract it - the team ID contains the league prefix, not the name
    const franchiseName = team.name;

    // Find Franchise Manager for this franchise
    const franchiseManager = await prisma.mLEPlayer.findFirst({
      where: {
        franchise: franchiseName,
        staffPosition: "Franchise Manager",
      },
      select: {
        id: true,
        name: true,
        staffPosition: true,
      },
    });

    // Find General Manager for this franchise
    const generalManager = await prisma.mLEPlayer.findFirst({
      where: {
        franchise: franchiseName,
        staffPosition: "General Manager",
      },
      select: {
        id: true,
        name: true,
        staffPosition: true,
      },
    });

    // Find Captain for this specific team
    const captain = await prisma.mLEPlayer.findFirst({
      where: {
        teamId: teamId,
        staffPosition: "Captain",
      },
      select: {
        id: true,
        name: true,
        staffPosition: true,
      },
    });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        leagueId: team.leagueId,
        franchise: franchiseName,
      },
      staff: {
        franchiseManager: franchiseManager || null,
        generalManager: generalManager || null,
        captain: captain || null,
      },
    });
  } catch (error) {
    console.error("Error fetching team staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch team staff" },
      { status: 500 }
    );
  }
}
