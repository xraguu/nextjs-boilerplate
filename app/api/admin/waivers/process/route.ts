import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateRosterSlotId } from "@/lib/id-generator";

/**
 * POST /api/admin/waivers/process
 * Process pending waiver claims (admin only)
 * Body: { claimIds?: string[], leagueId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { claimIds, leagueId } = body;

    // Build where clause
    const whereClause: any = {
      status: "pending",
    };

    if (claimIds && Array.isArray(claimIds)) {
      whereClause.id = { in: claimIds };
    } else if (leagueId) {
      whereClause.fantasyLeagueId = leagueId;
    }

    // Fetch all pending claims to process
    const claims = await prisma.waiverClaim.findMany({
      where: whereClause,
      orderBy: [
        { fantasyLeagueId: "asc" },
        { priority: "asc" },
      ],
      include: {
        fantasyTeam: {
          include: {
            league: {
              select: {
                currentWeek: true,
              },
            },
          },
        },
      },
    });

    if (claims.length === 0) {
      return NextResponse.json({
        message: "No pending waiver claims to process",
        processed: 0,
        approved: 0,
        denied: 0,
      });
    }

    const processedResults = {
      approved: 0,
      denied: 0,
      errors: [] as string[],
    };

    // Process each claim
    for (const claim of claims) {
      try {
        // Check if the team being added is available
        const teamAlreadyRostered = await prisma.rosterSlot.findFirst({
          where: {
            mleTeamId: claim.addTeamId,
            week: claim.fantasyTeam.league.currentWeek,
            fantasyTeam: {
              fantasyLeagueId: claim.fantasyLeagueId,
            },
          },
        });

        if (teamAlreadyRostered) {
          // Team is already rostered, deny the claim
          await prisma.$transaction(async (tx) => {
            await tx.waiverClaim.update({
              where: { id: claim.id },
              data: {
                status: "denied",
                processedAt: new Date(),
              },
            });

            await tx.transaction.create({
              data: {
                fantasyLeagueId: claim.fantasyLeagueId,
                fantasyTeamId: claim.fantasyTeamId,
                userId: claim.userId,
                type: "waiver",
                addTeamId: claim.addTeamId,
                dropTeamId: claim.dropTeamId,
                waiverClaimId: claim.id,
                faabBid: claim.faabBid,
                status: "denied",
                reason: "Team already rostered",
                processedAt: new Date(),
              },
            });
          });

          processedResults.denied++;
          continue;
        }

        // Process the waiver claim
        await prisma.$transaction(async (tx) => {
          // If there's a drop team, remove it from roster
          if (claim.dropTeamId) {
            const slotToDrop = await tx.rosterSlot.findFirst({
              where: {
                fantasyTeamId: claim.fantasyTeamId,
                mleTeamId: claim.dropTeamId,
                week: claim.fantasyTeam.league.currentWeek,
              },
            });

            if (slotToDrop) {
              await tx.rosterSlot.delete({
                where: { id: slotToDrop.id },
              });
            }
          }

          // Find an empty slot or use the dropped team's slot
          let targetSlot = await tx.rosterSlot.findFirst({
            where: {
              fantasyTeamId: claim.fantasyTeamId,
              week: claim.fantasyTeam.league.currentWeek,
              mleTeamId: claim.dropTeamId || undefined,
            },
          });

          if (!targetSlot) {
            // Find first empty slot
            // Get all existing slots
            const existingSlots = await tx.rosterSlot.findMany({
              where: {
                fantasyTeamId: claim.fantasyTeamId,
                week: claim.fantasyTeam.league.currentWeek,
              },
            });

            // For now, just create a new slot in "starter" position (you may need to adjust this logic)
            const position = "starter";
            const slotIndex = existingSlots.filter(s => s.position === position).length;
            const rosterSlotId = generateRosterSlotId(
              claim.fantasyTeamId,
              claim.fantasyTeam.league.currentWeek,
              position,
              slotIndex
            );

            await tx.rosterSlot.create({
              data: {
                id: rosterSlotId,
                fantasyTeamId: claim.fantasyTeamId,
                mleTeamId: claim.addTeamId,
                week: claim.fantasyTeam.league.currentWeek,
                position,
                slotIndex,
                isLocked: false,
              },
            });
          } else {
            // Update existing slot
            await tx.rosterSlot.update({
              where: { id: targetSlot.id },
              data: {
                mleTeamId: claim.addTeamId,
              },
            });
          }

          // Update waiver claim status
          await tx.waiverClaim.update({
            where: { id: claim.id },
            data: {
              status: "approved",
              processedAt: new Date(),
            },
          });

          // Deduct FAAB if applicable
          if (claim.faabBid && claim.faabBid > 0) {
            await tx.fantasyTeam.update({
              where: { id: claim.fantasyTeamId },
              data: {
                faabRemaining: {
                  decrement: claim.faabBid,
                },
              },
            });
          }

          // Create transaction record
          await tx.transaction.create({
            data: {
              fantasyLeagueId: claim.fantasyLeagueId,
              fantasyTeamId: claim.fantasyTeamId,
              userId: claim.userId,
              type: "waiver",
              addTeamId: claim.addTeamId,
              dropTeamId: claim.dropTeamId,
              waiverClaimId: claim.id,
              faabBid: claim.faabBid,
              status: "approved",
              processedAt: new Date(),
            },
          });
        });

        processedResults.approved++;
      } catch (error) {
        console.error(`Error processing waiver claim ${claim.id}:`, error);
        processedResults.errors.push(`Failed to process claim ${claim.id}`);
      }
    }

    return NextResponse.json({
      message: `Processed ${claims.length} waiver claims`,
      processed: claims.length,
      approved: processedResults.approved,
      denied: processedResults.denied,
      errors: processedResults.errors,
    });
  } catch (error) {
    console.error("Error processing waivers:", error);
    return NextResponse.json(
      { error: "Failed to process waivers" },
      { status: 500 }
    );
  }
}
