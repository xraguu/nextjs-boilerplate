import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateRosterSlotId } from "@/lib/id-generator";

/**
 * POST /api/leagues/[leagueId]/draft/pick
 * Submit a draft pick
 * Body: { mleTeamId: string, isAutoPick?: boolean }
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
    const { mleTeamId, isAutoPick = false } = body;

    if (!mleTeamId) {
      return NextResponse.json(
        { error: "mleTeamId is required" },
        { status: 400 }
      );
    }

    // Get the league and draft state
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        fantasyTeams: {
          where: {
            ownerUserId: session.user.id,
          },
        },
        draftPicks: {
          orderBy: {
            overallPick: "asc",
          },
        },
      },
    });

    if (!league) {
      return NextResponse.json(
        { error: "Fantasy league not found" },
        { status: 404 }
      );
    }

    const draftStatus = (league as any).draftStatus || "not_started";
    if (draftStatus !== "in_progress") {
      return NextResponse.json(
        { error: "Draft is not currently in progress" },
        { status: 400 }
      );
    }

    // Find current pick
    const currentPick = league.draftPicks.find((pick) => !pick.pickedAt);
    if (!currentPick) {
      return NextResponse.json(
        { error: "No picks remaining" },
        { status: 400 }
      );
    }

    // Get user's fantasy team in this league
    const userTeam = league.fantasyTeams[0];
    if (!userTeam) {
      return NextResponse.json(
        { error: "You are not in this league" },
        { status: 403 }
      );
    }

    // Check if it's this user's pick
    if (currentPick.fantasyTeamId !== userTeam.id) {
      return NextResponse.json(
        { error: "It is not your turn to pick" },
        { status: 403 }
      );
    }

    // Verify the MLE team exists and hasn't been picked
    const mleTeam = await prisma.mLETeam.findUnique({
      where: { id: mleTeamId },
    });

    if (!mleTeam) {
      return NextResponse.json(
        { error: "MLE team not found" },
        { status: 404 }
      );
    }

    // Check if team is already drafted
    const alreadyPicked = league.draftPicks.some(
      (pick) => pick.mleTeamId === mleTeamId && pick.pickedAt
    );
    if (alreadyPicked) {
      return NextResponse.json(
        { error: "This team has already been drafted" },
        { status: 400 }
      );
    }

    // Execute the pick
    const updatedPick = await prisma.draftPick.update({
      where: { id: currentPick.id },
      data: {
        mleTeamId,
        pickedAt: new Date(),
      },
    });

    // Add team to roster (week 1, first available bench slot)
    // Get roster config from league
    const rosterConfig = league.rosterConfig as any;
    const benchSlots = rosterConfig?.be || 3;

    // Find next available bench slot for week 1
    const existingRosterSlots = await prisma.rosterSlot.findMany({
      where: {
        fantasyTeamId: userTeam.id,
        week: 1,
        position: "be",
      },
    });

    const nextBenchIndex = existingRosterSlots.length;

    if (nextBenchIndex >= benchSlots) {
      // Roster is full, this shouldn't happen during draft
      console.error("Roster is full but draft is still ongoing");
    }

    const rosterSlotId = generateRosterSlotId(
      userTeam.id,
      1,
      "be",
      nextBenchIndex
    );
    await prisma.rosterSlot.create({
      data: {
        id: rosterSlotId,
        fantasyTeamId: userTeam.id,
        mleTeamId,
        week: 1,
        position: "be",
        slotIndex: nextBenchIndex,
        isLocked: false,
      },
    });

    // Calculate next pick deadline
    const pickTimeSeconds = (league as any).draftPickTimeSeconds || 90;
    const nextDeadline = new Date(Date.now() + pickTimeSeconds * 1000);

    // Find next pick
    const nextPick = league.draftPicks.find(
      (pick) =>
        !pick.pickedAt && pick.overallPick > currentPick.overallPick
    );

    if (nextPick) {
      // Update league with next pick deadline
      await prisma.fantasyLeague.update({
        where: { id: leagueId },
        data: {
          // @ts-ignore - custom fields
          draftPickDeadline: nextDeadline,
        },
      });
    } else {
      // Draft is complete
      await prisma.fantasyLeague.update({
        where: { id: leagueId },
        data: {
          // @ts-ignore - custom fields
          draftStatus: "completed",
          draftPickDeadline: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      pick: {
        id: updatedPick.id,
        round: updatedPick.round,
        pickNumber: updatedPick.pickNumber,
        overallPick: updatedPick.overallPick,
        mleTeamId: updatedPick.mleTeamId,
        pickedAt: updatedPick.pickedAt,
      },
      nextPickDeadline: nextPick ? nextDeadline : null,
      draftCompleted: !nextPick,
    });
  } catch (error) {
    console.error("Error making draft pick:", error);
    return NextResponse.json(
      { error: "Failed to make draft pick" },
      { status: 500 }
    );
  }
}
