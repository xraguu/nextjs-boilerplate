import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leagues/[leagueId]/user
 * Get the current user's fantasy team in this league
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

    // Find the user's fantasy team in this league
    const fantasyTeam = await prisma.fantasyTeam.findFirst({
      where: {
        fantasyLeagueId: leagueId,
        ownerUserId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            currentWeek: true,
          },
        },
      },
    });

    if (!fantasyTeam) {
      return NextResponse.json(
        { error: "You don't have a team in this league" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fantasyTeam: {
        id: fantasyTeam.id,
        displayName: fantasyTeam.displayName,
        shortCode: fantasyTeam.shortCode,
        draftPosition: fantasyTeam.draftPosition,
        faabRemaining: fantasyTeam.faabRemaining,
        waiverPriority: fantasyTeam.waiverPriority,
        ownerDisplayName: fantasyTeam.owner.displayName,
      },
      league: {
        id: fantasyTeam.league.id,
        name: fantasyTeam.league.name,
        currentWeek: fantasyTeam.league.currentWeek,
      },
    });
  } catch (error) {
    console.error("Error fetching user team:", error);
    return NextResponse.json(
      { error: "Failed to fetch user team" },
      { status: 500 }
    );
  }
}
