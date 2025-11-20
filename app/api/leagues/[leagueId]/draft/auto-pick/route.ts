import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/leagues/[leagueId]/draft/auto-pick
 * Auto-pick for a team when timer expires
 * This is called by a background job/cron
 * Body: { fantasyTeamId: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params;
    const body = await req.json();
    const { fantasyTeamId } = body;

    if (!fantasyTeamId) {
      return NextResponse.json(
        { error: "fantasyTeamId is required" },
        { status: 400 }
      );
    }

    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        fantasyTeams: {
          where: { id: fantasyTeamId },
        },
        draftPicks: {
          orderBy: {
            overallPick: "asc",
          },
        },
      },
    });

    if (!league || league.fantasyTeams.length === 0) {
      return NextResponse.json(
        { error: "Fantasy team not found in this league" },
        { status: 404 }
      );
    }

    const draftStatus = (league as any).draftStatus;
    if (draftStatus !== "in_progress") {
      return NextResponse.json(
        { error: "Draft is not in progress" },
        { status: 400 }
      );
    }

    const userTeam = league.fantasyTeams[0];

    // Find current pick for this team
    const currentPick = league.draftPicks.find(
      (pick) => pick.fantasyTeamId === fantasyTeamId && !pick.pickedAt
    );

    if (!currentPick) {
      return NextResponse.json(
        { error: "No unpicked picks for this team" },
        { status: 400 }
      );
    }

    // Get the user's draft queue (stored in localStorage on client, we need to get it from somewhere)
    // For now, we'll implement "best available" logic
    // In a real implementation, you might store the draft queue in the database

    // Strategy: Queue then best available
    // 1. Check if user has a draft queue saved (you'd need to store this in DB)
    // 2. If not, pick best available based on fantasy rank

    // Get all drafted team IDs
    const draftedTeamIds = league.draftPicks
      .filter((pick) => pick.mleTeamId && pick.pickedAt)
      .map((pick) => pick.mleTeamId!);

    // Get available teams sorted by weekly stats (best first)
    const availableTeams = await prisma.mLETeam.findMany({
      where: {
        id: {
          notIn: draftedTeamIds,
        },
      },
      include: {
        weeklyStats: {
          orderBy: {
            week: "desc",
          },
          take: 1,
        },
      },
    });

    if (availableTeams.length === 0) {
      return NextResponse.json(
        { error: "No available teams to draft" },
        { status: 400 }
      );
    }

    // Rank teams by average sprocket rating (or other metrics)
    const rankedTeams = availableTeams
      .map((team) => ({
        team,
        score: team.weeklyStats[0]?.sprocketRating || 0,
      }))
      .sort((a, b) => b.score - a.score);

    const bestTeam = rankedTeams[0].team;

    // Execute the auto-pick
    const updatedPick = await prisma.draftPick.update({
      where: { id: currentPick.id },
      data: {
        mleTeamId: bestTeam.id,
        pickedAt: new Date(),
      },
    });

    // Add to roster
    const rosterConfig = league.rosterConfig as any;
    const benchSlots = rosterConfig?.be || 3;

    const existingRosterSlots = await prisma.rosterSlot.findMany({
      where: {
        fantasyTeamId,
        week: 1,
        position: "be",
      },
    });

    const nextBenchIndex = existingRosterSlots.length;

    if (nextBenchIndex < benchSlots) {
      await prisma.rosterSlot.create({
        data: {
          fantasyTeamId,
          mleTeamId: bestTeam.id,
          week: 1,
          position: "be",
          slotIndex: nextBenchIndex,
          isLocked: false,
        },
      });
    }

    // Calculate next pick deadline
    const pickTimeSeconds = (league as any).draftPickTimeSeconds || 90;
    const nextDeadline = new Date(Date.now() + pickTimeSeconds * 1000);

    // Find next pick
    const nextPick = league.draftPicks.find(
      (pick) =>
        !pick.pickedAt && pick.overallPick > currentPick.overallPick
    );

    if (nextPick) {
      await prisma.fantasyLeague.update({
        where: { id: leagueId },
        data: {
          // @ts-ignore - custom fields
          draftPickDeadline: nextDeadline,
        },
      });
    } else {
      // Draft completed
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
      isAutoPick: true,
      pick: {
        id: updatedPick.id,
        round: updatedPick.round,
        pickNumber: updatedPick.pickNumber,
        overallPick: updatedPick.overallPick,
        mleTeamId: updatedPick.mleTeamId,
        pickedAt: updatedPick.pickedAt,
      },
      selectedTeam: {
        id: bestTeam.id,
        name: bestTeam.name,
        leagueId: bestTeam.leagueId,
      },
      nextPickDeadline: nextPick ? nextDeadline : null,
      draftCompleted: !nextPick,
    });
  } catch (error) {
    console.error("Error in auto-pick:", error);
    return NextResponse.json(
      { error: "Failed to execute auto-pick" },
      { status: 500 }
    );
  }
}
