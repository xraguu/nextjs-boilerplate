import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leagues/[leagueId]/waivers
 * Get all pending waiver claims for a league
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

    // Fetch all pending waiver claims for this league
    const waiverClaims = await prisma.waiverClaim.findMany({
      where: {
        fantasyLeagueId: leagueId,
        status: "pending",
      },
      orderBy: {
        priority: "asc",
      },
    });

    return NextResponse.json({ waiverClaims });
  } catch (error) {
    console.error("Error fetching waiver claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch waiver claims" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leagues/[leagueId]/waivers
 * Submit a new waiver claim
 * Body: { fantasyTeamId: string, addTeamId: string, dropTeamId?: string, faabBid?: number }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId } = await params;
    const body = await req.json();
    const { fantasyTeamId, addTeamId, dropTeamId, faabBid } = body;

    // Validate required fields
    if (!fantasyTeamId || !addTeamId) {
      return NextResponse.json(
        { error: "Missing required fields: fantasyTeamId, addTeamId" },
        { status: 400 }
      );
    }

    // Verify the fantasy team exists and user owns it
    const fantasyTeam = await prisma.fantasyTeam.findUnique({
      where: { id: fantasyTeamId },
      select: {
        id: true,
        fantasyLeagueId: true,
        ownerUserId: true,
        waiverPriority: true,
      },
    });

    if (!fantasyTeam) {
      return NextResponse.json(
        { error: "Fantasy team not found" },
        { status: 404 }
      );
    }

    if (fantasyTeam.ownerUserId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't own this team" },
        { status: 403 }
      );
    }

    if (fantasyTeam.fantasyLeagueId !== leagueId) {
      return NextResponse.json(
        { error: "Team does not belong to this league" },
        { status: 400 }
      );
    }

    // Create waiver claim
    const waiverClaim = await prisma.waiverClaim.create({
      data: {
        fantasyLeagueId: leagueId,
        fantasyTeamId,
        userId: session.user.id,
        addTeamId,
        dropTeamId: dropTeamId || null,
        faabBid: faabBid || null,
        priority: fantasyTeam.waiverPriority || 999,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      waiverClaim,
    });
  } catch (error) {
    console.error("Error creating waiver claim:", error);
    return NextResponse.json(
      { error: "Failed to create waiver claim" },
      { status: 500 }
    );
  }
}
