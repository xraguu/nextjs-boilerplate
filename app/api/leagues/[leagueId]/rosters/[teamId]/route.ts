import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leagues/[leagueId]/rosters/[teamId]
 * Get all roster slots for a fantasy team for a specific week
 * Query params: ?week=1
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId, teamId } = await params;
    const url = new URL(req.url);
    const week = parseInt(url.searchParams.get("week") || "1");

    // Verify the fantasy team exists and user has access
    const fantasyTeam = await prisma.fantasyTeam.findUnique({
      where: { id: teamId },
      include: {
        league: {
          select: {
            id: true,
            currentWeek: true,
            rosterConfig: true,
          },
        },
        owner: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!fantasyTeam) {
      return NextResponse.json(
        { error: "Fantasy team not found" },
        { status: 404 }
      );
    }

    if (fantasyTeam.fantasyLeagueId !== leagueId) {
      return NextResponse.json(
        { error: "Team does not belong to this league" },
        { status: 400 }
      );
    }

    // Get roster slots for the specified week
    const rosterSlots = await prisma.rosterSlot.findMany({
      where: {
        fantasyTeamId: teamId,
        week,
      },
      include: {
        mleTeam: {
          include: {
            weeklyStats: {
              where: { week },
              take: 1,
            },
          },
        },
      },
      orderBy: [{ position: "asc" }, { slotIndex: "asc" }],
    });

    // For each MLE team, get roster status and calculate stats
    const enrichedSlots = await Promise.all(
      rosterSlots.map(async (slot) => {
        // Get all weekly stats for this team to calculate averages
        const allWeeklyStats = await prisma.teamWeeklyStats.findMany({
          where: { teamId: slot.mleTeam.id },
        });

        // Calculate total stats and record
        const totalWins = allWeeklyStats.reduce((sum, s) => sum + s.wins, 0);
        const totalLosses = allWeeklyStats.reduce((sum, s) => sum + s.losses, 0);
        const totalGoals = allWeeklyStats.reduce((sum, s) => sum + s.goals, 0);
        const totalShots = allWeeklyStats.reduce((sum, s) => sum + s.shots, 0);
        const totalSaves = allWeeklyStats.reduce((sum, s) => sum + s.saves, 0);
        const totalAssists = allWeeklyStats.reduce((sum, s) => sum + s.assists, 0);
        const totalDemos = allWeeklyStats.reduce((sum, s) => sum + s.demosInflicted, 0);

        // Calculate fantasy points (simplified scoring: goals*2 + shots*0.1 + saves*1 + assists*1.5 + demos*0.5)
        const calculateFantasyPoints = (stats: any) => {
          return (stats.goals * 2) + (stats.shots * 0.1) + (stats.saves * 1) + (stats.assists * 1.5) + (stats.demosInflicted * 0.5);
        };

        const totalFantasyPoints = allWeeklyStats.reduce((sum, s) => sum + calculateFantasyPoints(s), 0);
        const avgFantasyPoints = allWeeklyStats.length > 0 ? totalFantasyPoints / allWeeklyStats.length : 0;
        const lastWeekStats = allWeeklyStats.find(s => s.week === week - 1);
        const lastWeekPoints = lastWeekStats ? calculateFantasyPoints(lastWeekStats) : 0;

        // Check if team is rostered in this league
        const rosteredSlot = await prisma.rosterSlot.findFirst({
          where: {
            mleTeamId: slot.mleTeam.id,
            week,
            fantasyTeam: {
              fantasyLeagueId: leagueId,
            },
          },
          include: {
            fantasyTeam: {
              include: {
                owner: {
                  select: {
                    displayName: true,
                  },
                },
              },
            },
          },
        });

        // Check if team is on waivers
        const onWaivers = await prisma.waiverClaim.findFirst({
          where: {
            addTeamId: slot.mleTeam.id,
            fantasyLeagueId: leagueId,
            status: "pending",
          },
        });

        const currentWeekStats = slot.mleTeam.weeklyStats[0];

        return {
          id: slot.id,
          position: slot.position,
          slotIndex: slot.slotIndex,
          isLocked: slot.isLocked,
          fantasyPoints: slot.fantasyPoints,
          mleTeam: {
            id: slot.mleTeam.id,
            name: slot.mleTeam.name,
            leagueId: slot.mleTeam.leagueId,
            slug: slot.mleTeam.slug,
            logoPath: slot.mleTeam.logoPath,
            primaryColor: slot.mleTeam.primaryColor,
            secondaryColor: slot.mleTeam.secondaryColor,
            weeklyStats: currentWeekStats,
            // Additional stats for modal
            record: `${totalWins}-${totalLosses}`,
            goals: totalGoals,
            shots: totalShots,
            saves: totalSaves,
            assists: totalAssists,
            demos: totalDemos,
            fpts: totalFantasyPoints,
            avg: avgFantasyPoints,
            last: lastWeekPoints,
            status: onWaivers ? "waiver" : (rosteredSlot ? "rostered" : "free-agent"),
            rosteredBy: rosteredSlot ? {
              rosterName: rosteredSlot.fantasyTeam.displayName,
              managerName: rosteredSlot.fantasyTeam.owner.displayName,
            } : undefined,
          },
        };
      })
    );

    return NextResponse.json({
      fantasyTeam: {
        id: fantasyTeam.id,
        displayName: fantasyTeam.displayName,
        shortCode: fantasyTeam.shortCode,
        ownerDisplayName: fantasyTeam.owner.displayName,
        faabRemaining: fantasyTeam.faabRemaining,
        waiverPriority: fantasyTeam.waiverPriority,
      },
      league: {
        id: fantasyTeam.league.id,
        currentWeek: fantasyTeam.league.currentWeek,
        rosterConfig: fantasyTeam.league.rosterConfig,
        waiverSystem: fantasyTeam.league.waiverSystem,
      },
      week,
      rosterSlots: enrichedSlots,
    });
  } catch (error) {
    console.error("Error fetching roster:", error);
    return NextResponse.json(
      { error: "Failed to fetch roster" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leagues/[leagueId]/rosters/[teamId]
 * Add an MLE team to a roster slot (for pickups/trades)
 * Body: { week: number, position: string, slotIndex: number, mleTeamId: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId, teamId } = await params;
    const body = await req.json();
    const { week, position, slotIndex, mleTeamId } = body;

    // Validate required fields
    if (!week || !position || slotIndex === undefined || !mleTeamId) {
      return NextResponse.json(
        { error: "Missing required fields: week, position, slotIndex, mleTeamId" },
        { status: 400 }
      );
    }

    // Verify the fantasy team exists and user owns it
    const fantasyTeam = await prisma.fantasyTeam.findUnique({
      where: { id: teamId },
      include: {
        league: {
          select: {
            id: true,
            rosterConfig: true,
          },
        },
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

    // Validate position and slotIndex against rosterConfig
    const rosterConfig = fantasyTeam.league.rosterConfig as any;
    const positionKey = position.toLowerCase();
    const maxSlots = rosterConfig[positionKey];

    if (maxSlots === undefined) {
      return NextResponse.json(
        { error: `Invalid position: ${position}` },
        { status: 400 }
      );
    }

    if (slotIndex >= maxSlots) {
      return NextResponse.json(
        { error: `Invalid slotIndex ${slotIndex} for position ${position}. Max is ${maxSlots - 1}` },
        { status: 400 }
      );
    }

    // Check if MLE team exists
    const mleTeam = await prisma.mLETeam.findUnique({
      where: { id: mleTeamId },
    });

    if (!mleTeam) {
      return NextResponse.json(
        { error: "MLE team not found" },
        { status: 404 }
      );
    }

    // Check if slot already exists (would be an update, not create)
    const existingSlot = await prisma.rosterSlot.findUnique({
      where: {
        fantasyTeamId_week_position_slotIndex: {
          fantasyTeamId: teamId,
          week,
          position,
          slotIndex,
        },
      },
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: "Slot already occupied. Use PATCH to update." },
        { status: 400 }
      );
    }

    // Create the roster slot
    const rosterSlot = await prisma.rosterSlot.create({
      data: {
        fantasyTeamId: teamId,
        mleTeamId,
        week,
        position,
        slotIndex,
        isLocked: false,
      },
      include: {
        mleTeam: true,
      },
    });

    return NextResponse.json({
      success: true,
      rosterSlot: {
        id: rosterSlot.id,
        position: rosterSlot.position,
        slotIndex: rosterSlot.slotIndex,
        isLocked: rosterSlot.isLocked,
        mleTeam: {
          id: rosterSlot.mleTeam.id,
          name: rosterSlot.mleTeam.name,
          leagueId: rosterSlot.mleTeam.leagueId,
          slug: rosterSlot.mleTeam.slug,
          logoPath: rosterSlot.mleTeam.logoPath,
        },
      },
    });
  } catch (error) {
    console.error("Error adding to roster:", error);
    return NextResponse.json(
      { error: "Failed to add to roster" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/leagues/[leagueId]/rosters/[teamId]
 * Update roster slot (move teams between slots for lineup changes)
 * Body: { rosterSlotId: string, newPosition: string, newSlotIndex: number }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId, teamId } = await params;
    const body = await req.json();
    const { rosterSlotId, newPosition, newSlotIndex } = body;

    if (!rosterSlotId || !newPosition || newSlotIndex === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: rosterSlotId, newPosition, newSlotIndex" },
        { status: 400 }
      );
    }

    // Get the roster slot to update
    const rosterSlot = await prisma.rosterSlot.findUnique({
      where: { id: rosterSlotId },
      include: {
        fantasyTeam: {
          include: {
            league: {
              select: {
                id: true,
                rosterConfig: true,
              },
            },
          },
        },
      },
    });

    if (!rosterSlot) {
      return NextResponse.json(
        { error: "Roster slot not found" },
        { status: 404 }
      );
    }

    // Verify ownership and league
    if (rosterSlot.fantasyTeam.ownerUserId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't own this team" },
        { status: 403 }
      );
    }

    if (rosterSlot.fantasyTeam.fantasyLeagueId !== leagueId) {
      return NextResponse.json(
        { error: "Team does not belong to this league" },
        { status: 400 }
      );
    }

    // Check if locked
    if (rosterSlot.isLocked) {
      return NextResponse.json(
        { error: "This roster slot is locked and cannot be modified" },
        { status: 400 }
      );
    }

    // Validate new position
    const rosterConfig = rosterSlot.fantasyTeam.league.rosterConfig as any;
    const positionKey = newPosition.toLowerCase();
    const maxSlots = rosterConfig[positionKey];

    if (maxSlots === undefined) {
      return NextResponse.json(
        { error: `Invalid position: ${newPosition}` },
        { status: 400 }
      );
    }

    if (newSlotIndex >= maxSlots) {
      return NextResponse.json(
        { error: `Invalid slotIndex ${newSlotIndex} for position ${newPosition}. Max is ${maxSlots - 1}` },
        { status: 400 }
      );
    }

    // Check if target slot is occupied
    const targetSlot = await prisma.rosterSlot.findUnique({
      where: {
        fantasyTeamId_week_position_slotIndex: {
          fantasyTeamId: teamId,
          week: rosterSlot.week,
          position: newPosition,
          slotIndex: newSlotIndex,
        },
      },
    });

    // If target slot exists and is locked, can't swap
    if (targetSlot && targetSlot.isLocked) {
      return NextResponse.json(
        { error: "Target slot is locked and cannot be swapped" },
        { status: 400 }
      );
    }

    // Perform the swap/move
    if (targetSlot) {
      // Swap the two slots
      await prisma.$transaction([
        // Temporarily move target to a placeholder
        prisma.rosterSlot.update({
          where: { id: targetSlot.id },
          data: {
            position: "temp",
            slotIndex: 999,
          },
        }),
        // Move source to target position
        prisma.rosterSlot.update({
          where: { id: rosterSlotId },
          data: {
            position: newPosition,
            slotIndex: newSlotIndex,
          },
        }),
        // Move target to source position
        prisma.rosterSlot.update({
          where: { id: targetSlot.id },
          data: {
            position: rosterSlot.position,
            slotIndex: rosterSlot.slotIndex,
          },
        }),
      ]);
    } else {
      // Just move to empty slot
      await prisma.rosterSlot.update({
        where: { id: rosterSlotId },
        data: {
          position: newPosition,
          slotIndex: newSlotIndex,
        },
      });
    }

    // Fetch updated roster
    const updatedRoster = await prisma.rosterSlot.findMany({
      where: {
        fantasyTeamId: teamId,
        week: rosterSlot.week,
      },
      include: {
        mleTeam: true,
      },
      orderBy: [{ position: "asc" }, { slotIndex: "asc" }],
    });

    return NextResponse.json({
      success: true,
      rosterSlots: updatedRoster.map((slot) => ({
        id: slot.id,
        position: slot.position,
        slotIndex: slot.slotIndex,
        isLocked: slot.isLocked,
        mleTeam: {
          id: slot.mleTeam.id,
          name: slot.mleTeam.name,
          leagueId: slot.mleTeam.leagueId,
          slug: slot.mleTeam.slug,
          logoPath: slot.mleTeam.logoPath,
        },
      })),
    });
  } catch (error) {
    console.error("Error updating roster:", error);
    return NextResponse.json(
      { error: "Failed to update roster" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leagues/[leagueId]/rosters/[teamId]
 * Remove an MLE team from a roster slot (drops)
 * Body: { rosterSlotId: string }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId, teamId } = await params;
    const body = await req.json();
    const { rosterSlotId } = body;

    if (!rosterSlotId) {
      return NextResponse.json(
        { error: "Missing required field: rosterSlotId" },
        { status: 400 }
      );
    }

    // Get the roster slot
    const rosterSlot = await prisma.rosterSlot.findUnique({
      where: { id: rosterSlotId },
      include: {
        fantasyTeam: {
          include: {
            league: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!rosterSlot) {
      return NextResponse.json(
        { error: "Roster slot not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (rosterSlot.fantasyTeam.ownerUserId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't own this team" },
        { status: 403 }
      );
    }

    if (rosterSlot.fantasyTeam.fantasyLeagueId !== leagueId) {
      return NextResponse.json(
        { error: "Team does not belong to this league" },
        { status: 400 }
      );
    }

    // Check if locked
    if (rosterSlot.isLocked) {
      return NextResponse.json(
        { error: "This roster slot is locked and cannot be removed" },
        { status: 400 }
      );
    }

    // Delete the roster slot
    await prisma.rosterSlot.delete({
      where: { id: rosterSlotId },
    });

    return NextResponse.json({
      success: true,
      message: "Roster slot removed successfully",
    });
  } catch (error) {
    console.error("Error removing from roster:", error);
    return NextResponse.json(
      { error: "Failed to remove from roster" },
      { status: 500 }
    );
  }
}
