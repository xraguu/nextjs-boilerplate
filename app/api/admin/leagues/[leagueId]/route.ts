import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/leagues/[leagueId] - Get detailed league info (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId } = await params;

    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        fantasyTeams: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                discordId: true,
              },
            },
            roster: {
              select: {
                id: true,
                week: true,
              },
            },
          },
          orderBy: {
            draftPosition: "asc",
          },
        },
        draftPicks: {
          orderBy: {
            overallPick: "asc",
          },
          take: 10,
        },
        _count: {
          select: {
            fantasyTeams: true,
            draftPicks: true,
            matchups: true,
            trades: true,
            waivers: true,
          },
        },
      },
    });

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    return NextResponse.json({ league });
  } catch (error) {
    console.error("Error fetching league:", error);
    return NextResponse.json(
      { error: "Failed to fetch league" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/leagues/[leagueId] - Update league settings (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId } = await params;
    const body = await request.json();
    const { name, currentWeek, maxTeams } = body;

    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (name) updateData.name = name;
    if (currentWeek !== undefined) updateData.currentWeek = parseInt(currentWeek);
    if (maxTeams !== undefined) updateData.maxTeams = parseInt(maxTeams);

    // Update the league
    const updatedLeague = await prisma.fantasyLeague.update({
      where: { id: leagueId },
      data: updateData,
    });

    return NextResponse.json({ league: updatedLeague, success: true });
  } catch (error) {
    console.error("Error updating league:", error);
    return NextResponse.json(
      { error: "Failed to update league" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/leagues/[leagueId] - Delete league (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId } = await params;

    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    // Delete all related data in correct order
    await prisma.$transaction([
      prisma.matchup.deleteMany({ where: { fantasyLeagueId: leagueId } }),
      prisma.waiverClaim.deleteMany({ where: { fantasyLeagueId: leagueId } }),
      prisma.trade.deleteMany({ where: { fantasyLeagueId: leagueId } }),
      prisma.rosterSlot.deleteMany({
        where: { fantasyTeam: { fantasyLeagueId: leagueId } },
      }),
      prisma.draftPick.deleteMany({ where: { fantasyLeagueId: leagueId } }),
      prisma.fantasyTeam.deleteMany({ where: { fantasyLeagueId: leagueId } }),
      prisma.fantasyLeague.delete({ where: { id: leagueId } }),
    ]);

    return NextResponse.json({ success: true, message: "League deleted successfully" });
  } catch (error) {
    console.error("Error deleting league:", error);
    return NextResponse.json(
      { error: "Failed to delete league" },
      { status: 500 }
    );
  }
}
