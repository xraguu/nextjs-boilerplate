import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/leagues/[leagueId]/trades/[tradeId]
 * Accept or reject a trade
 * Body: { action: "accept" | "reject" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string; tradeId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId, tradeId } = await params;
    const body = await req.json();
    const { action } = body;

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    // Get the trade
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        proposerTeam: true,
        receiverTeam: true,
      },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    if (trade.fantasyLeagueId !== leagueId) {
      return NextResponse.json(
        { error: "Trade does not belong to this league" },
        { status: 400 }
      );
    }

    // Only the receiver can accept/reject
    if (trade.receiverTeam.ownerUserId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the trade receiver can respond to this trade" },
        { status: 403 }
      );
    }

    // Check if trade is still pending
    if (trade.status !== "pending") {
      return NextResponse.json(
        { error: `Trade is already ${trade.status}` },
        { status: 400 }
      );
    }

    if (action === "reject") {
      // Simply update status to rejected
      const updatedTrade = await prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: "rejected",
        },
      });

      return NextResponse.json({
        success: true,
        trade: updatedTrade,
      });
    }

    // Action is "accept" - execute the trade
    // This requires swapping teams between rosters
    const result = await prisma.$transaction(async (tx) => {
      // Get current week from league
      const league = await tx.fantasyLeague.findUnique({
        where: { id: leagueId },
        select: { currentWeek: true },
      });

      if (!league) {
        throw new Error("League not found");
      }

      const currentWeek = league.currentWeek;

      // Get roster slots for both teams
      const proposerSlots = await tx.rosterSlot.findMany({
        where: {
          fantasyTeamId: trade.proposerTeamId,
          mleTeamId: {
            in: trade.proposerGives as string[],
          },
          week: currentWeek,
        },
      });

      const receiverSlots = await tx.rosterSlot.findMany({
        where: {
          fantasyTeamId: trade.receiverTeamId,
          mleTeamId: {
            in: trade.receiverGives as string[],
          },
          week: currentWeek,
        },
      });

      // Swap the teams
      // Update proposer's slots to point to receiver's team
      for (const slot of proposerSlots) {
        await tx.rosterSlot.update({
          where: { id: slot.id },
          data: { fantasyTeamId: trade.receiverTeamId },
        });
      }

      // Update receiver's slots to point to proposer's team
      for (const slot of receiverSlots) {
        await tx.rosterSlot.update({
          where: { id: slot.id },
          data: { fantasyTeamId: trade.proposerTeamId },
        });
      }

      // Update trade status
      const updatedTrade = await tx.trade.update({
        where: { id: tradeId },
        data: {
          status: "accepted",
        },
      });

      // Create transaction records
      await tx.transaction.create({
        data: {
          fantasyLeagueId: leagueId,
          fantasyTeamId: trade.proposerTeamId,
          userId: trade.proposerUserId,
          type: "trade",
          addTeamId: (trade.receiverGives as string[])[0] || null, // Simplified
          dropTeamId: (trade.proposerGives as string[])[0] || null, // Simplified
          status: "approved",
          processedAt: new Date(),
        },
      });

      await tx.transaction.create({
        data: {
          fantasyLeagueId: leagueId,
          fantasyTeamId: trade.receiverTeamId,
          userId: trade.receiverUserId,
          type: "trade",
          addTeamId: (trade.proposerGives as string[])[0] || null, // Simplified
          dropTeamId: (trade.receiverGives as string[])[0] || null, // Simplified
          status: "approved",
          processedAt: new Date(),
        },
      });

      return updatedTrade;
    });

    return NextResponse.json({
      success: true,
      trade: result,
    });
  } catch (error) {
    console.error("Error updating trade:", error);
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leagues/[leagueId]/trades/[tradeId]
 * Cancel a trade (only if you are the proposer and it's still pending)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string; tradeId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId, tradeId } = await params;

    // Get the trade
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        proposerTeam: true,
      },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    if (trade.fantasyLeagueId !== leagueId) {
      return NextResponse.json(
        { error: "Trade does not belong to this league" },
        { status: 400 }
      );
    }

    // Only the proposer can cancel
    if (trade.proposerTeam.ownerUserId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the trade proposer can cancel this trade" },
        { status: 403 }
      );
    }

    // Check if trade is still pending
    if (trade.status !== "pending") {
      return NextResponse.json(
        { error: `Cannot cancel a trade that is ${trade.status}` },
        { status: 400 }
      );
    }

    // Delete the trade
    await prisma.trade.delete({
      where: { id: tradeId },
    });

    return NextResponse.json({
      success: true,
      message: "Trade cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling trade:", error);
    return NextResponse.json(
      { error: "Failed to cancel trade" },
      { status: 500 }
    );
  }
}
