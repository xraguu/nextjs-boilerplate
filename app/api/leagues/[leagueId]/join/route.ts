import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/leagues/[leagueId]/join - Join a fantasy league
export async function POST(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { status: true, displayName: true },
    });

    if (user?.status === "suspended") {
      return NextResponse.json(
        { error: "Suspended users cannot join leagues" },
        { status: 403 }
      );
    }

    const { leagueId } = params;
    const body = await request.json();
    const { teamName, shortCode } = body;

    // Validation
    if (!teamName || !shortCode) {
      return NextResponse.json(
        { error: "Team name and short code are required" },
        { status: 400 }
      );
    }

    if (shortCode.length !== 3) {
      return NextResponse.json(
        { error: "Short code must be exactly 3 characters" },
        { status: 400 }
      );
    }

    // Check if league exists
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        fantasyTeams: true,
      },
    });

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    // Check if league is full
    if (league.fantasyTeams.length >= league.maxTeams) {
      return NextResponse.json(
        { error: "League is full" },
        { status: 400 }
      );
    }

    // Check if user is already in the league
    const existingTeam = league.fantasyTeams.find(
      (team) => team.ownerUserId === session.user.id
    );

    if (existingTeam) {
      return NextResponse.json(
        { error: "You are already a member of this league" },
        { status: 400 }
      );
    }

    // Check if short code is already taken in this league
    const shortCodeTaken = league.fantasyTeams.some(
      (team) => team.shortCode.toLowerCase() === shortCode.toLowerCase()
    );

    if (shortCodeTaken) {
      return NextResponse.json(
        { error: "Short code is already taken in this league" },
        { status: 400 }
      );
    }

    // Create the fantasy team
    const fantasyTeam = await prisma.fantasyTeam.create({
      data: {
        fantasyLeagueId: leagueId,
        ownerUserId: session.user.id,
        displayName: teamName,
        shortCode: shortCode.toUpperCase(),
        draftPosition: league.fantasyTeams.length + 1,
        faabRemaining: league.waiverSystem === "faab" ? league.faabBudget : null,
        waiverPriority: league.waiverSystem !== "faab" ? league.fantasyTeams.length + 1 : null,
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        league: true,
      },
    });

    return NextResponse.json({ fantasyTeam }, { status: 201 });
  } catch (error) {
    console.error("Error joining league:", error);
    return NextResponse.json(
      { error: "Failed to join league" },
      { status: 500 }
    );
  }
}
