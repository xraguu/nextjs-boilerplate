import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/leagues/[leagueId]/roster/update
 * Update roster slots for a fantasy team
 */
export async function PUT(
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
    const { fantasyTeamId, week, roster } = body;

    if (!fantasyTeamId || !week || !roster || !Array.isArray(roster)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Verify that the user owns this fantasy team
    const fantasyTeam = await prisma.fantasyTeam.findUnique({
      where: { id: fantasyTeamId },
      select: {
        id: true,
        ownerUserId: true,
        fantasyLeagueId: true,
      },
    });

    if (!fantasyTeam) {
      return NextResponse.json({ error: "Fantasy team not found" }, { status: 404 });
    }

    if (fantasyTeam.ownerUserId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own roster" },
        { status: 403 }
      );
    }

    if (fantasyTeam.fantasyLeagueId !== leagueId) {
      return NextResponse.json(
        { error: "Fantasy team does not belong to this league" },
        { status: 400 }
      );
    }

    // Update roster slots
    // First, get the current roster slots to verify they exist and to update them
    const existingSlots = await prisma.rosterSlot.findMany({
      where: {
        fantasyTeamId: fantasyTeamId,
        week: week,
      },
    });

    // Update each slot
    const updates = roster
      .filter((slot: any) => slot.mleTeam) // Only update slots with teams
      .map((slot: any) => {
        const existingSlot = existingSlots.find(
          (s) => s.position === slot.position && s.slotIndex === slot.slotIndex
        );

        if (existingSlot) {
          // Update existing slot
          return prisma.rosterSlot.update({
            where: { id: existingSlot.id },
            data: {
              mleTeamId: slot.mleTeam.id,
            },
          });
        } else {
          // Create new slot if it doesn't exist
          return prisma.rosterSlot.create({
            data: {
              id: `${fantasyTeamId}-${week}-${slot.position}-${slot.slotIndex}`,
              fantasyTeamId: fantasyTeamId,
              mleTeamId: slot.mleTeam.id,
              week: week,
              position: slot.position,
              slotIndex: slot.slotIndex,
              isLocked: slot.isLocked || false,
              fantasyPoints: slot.fantasyPoints || 0,
            },
          });
        }
      });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Roster updated successfully",
    });
  } catch (error) {
    console.error("Error updating roster:", error);
    return NextResponse.json(
      { error: "Failed to update roster" },
      { status: 500 }
    );
  }
}
