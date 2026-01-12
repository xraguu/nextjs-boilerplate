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
    console.log('Staff API - Fetching staff for team ID:', teamId);

    // Find the team first to ensure it exists and get its name
    const team = await prisma.mLETeam.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        leagueId: true,
      },
    });

    console.log('Staff API - Team found:', team);

    if (!team) {
      console.log('Staff API - Team not found');
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // The team name is already the franchise name (e.g., "Bulls", "Aviators")
    // No need to extract it - the team ID contains the league prefix, not the name
    const franchiseName = team.name;
    console.log('Staff API - Using franchise name:', franchiseName);

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
    console.log('Staff API - Franchise Manager:', franchiseManager);

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
    console.log('Staff API - General Manager:', generalManager);

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
    console.log('Staff API - Captain:', captain);

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
    console.error("Staff API - Error fetching team staff:", error);
    console.error("Staff API - Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch team staff",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
