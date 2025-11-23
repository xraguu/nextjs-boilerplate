import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateRosterSlotId } from "@/lib/id-generator";

/**
 * POST /api/admin/trades/process
 * Process (approve or veto) a trade (admin only)
 * Body: { tradeId: string, action: "approve" | "veto", reason?: string }
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
    const { tradeId, action, reason } = body;

    if (!tradeId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: tradeId, action" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "veto") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'veto'" },
        { status: 400 }
      );
    }

    // Fetch the trade
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        league: {
          select: {
            currentWeek: true,
          },
        },
      },
    });

    if (!trade) {
      return NextResponse.json(
        { error: "Trade not found" },
        { status: 404 }
      );
    }

    if (trade.status !== "pending") {
      return NextResponse.json(
        { error: "Trade has already been processed" },
        { status: 400 }
      );
    }

    if (action === "veto") {
      // Veto the trade
      await prisma.$transaction(async (tx) => {
        await tx.trade.update({
          where: { id: tradeId },
          data: {
            status: "vetoed",
            executedAt: new Date(),
          },
        });

        // Create transaction records for both teams
        await tx.transaction.create({
          data: {
            fantasyLeagueId: trade.fantasyLeagueId,
            fantasyTeamId: trade.proposerTeamId,
            userId: trade.proposerUserId,
            type: "trade",
            tradeId: trade.id,
            tradePartnerTeamId: trade.receiverTeamId,
            tradePartnerGave: trade.receiverGives,
            addTeamId: null,
            dropTeamId: null,
            status: "vetoed",
            reason: reason || "Vetoed by admin",
            processedAt: new Date(),
          },
        });

        await tx.transaction.create({
          data: {
            fantasyLeagueId: trade.fantasyLeagueId,
            fantasyTeamId: trade.receiverTeamId,
            userId: trade.receiverUserId,
            type: "trade",
            tradeId: trade.id,
            tradePartnerTeamId: trade.proposerTeamId,
            tradePartnerGave: trade.proposerGives,
            addTeamId: null,
            dropTeamId: null,
            status: "vetoed",
            reason: reason || "Vetoed by admin",
            processedAt: new Date(),
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "Trade vetoed successfully",
      });
    }

    // Approve and execute the trade
    await prisma.$transaction(async (tx) => {
      const currentWeek = trade.league.currentWeek;

      // Remove proposer's teams and add receiver's teams to proposer
      for (const teamId of trade.proposerGives) {
        // Remove from proposer's roster
        const slotToRemove = await tx.rosterSlot.findFirst({
          where: {
            fantasyTeamId: trade.proposerTeamId,
            mleTeamId: teamId,
            week: currentWeek,
          },
        });

        if (slotToRemove) {
          await tx.rosterSlot.delete({
            where: { id: slotToRemove.id },
          });
        }
      }

      for (const teamId of trade.receiverGives) {
        // Add to proposer's roster
        const existingSlots = await tx.rosterSlot.findMany({
          where: {
            fantasyTeamId: trade.proposerTeamId,
            week: currentWeek,
          },
        });

        const position = "starter";
        const slotIndex = existingSlots.filter(s => s.position === position).length;
        const rosterSlotId = generateRosterSlotId(
          trade.proposerTeamId,
          currentWeek,
          position,
          slotIndex
        );

        await tx.rosterSlot.create({
          data: {
            id: rosterSlotId,
            fantasyTeamId: trade.proposerTeamId,
            mleTeamId: teamId,
            week: currentWeek,
            position,
            slotIndex,
            isLocked: false,
          },
        });
      }

      // Remove receiver's teams and add proposer's teams to receiver
      for (const teamId of trade.receiverGives) {
        // Remove from receiver's roster
        const slotToRemove = await tx.rosterSlot.findFirst({
          where: {
            fantasyTeamId: trade.receiverTeamId,
            mleTeamId: teamId,
            week: currentWeek,
          },
        });

        if (slotToRemove) {
          await tx.rosterSlot.delete({
            where: { id: slotToRemove.id },
          });
        }
      }

      for (const teamId of trade.proposerGives) {
        // Add to receiver's roster
        const existingSlots = await tx.rosterSlot.findMany({
          where: {
            fantasyTeamId: trade.receiverTeamId,
            week: currentWeek,
          },
        });

        const position = "starter";
        const slotIndex = existingSlots.filter(s => s.position === position).length;
        const rosterSlotId = generateRosterSlotId(
          trade.receiverTeamId,
          currentWeek,
          position,
          slotIndex
        );

        await tx.rosterSlot.create({
          data: {
            id: rosterSlotId,
            fantasyTeamId: trade.receiverTeamId,
            mleTeamId: teamId,
            week: currentWeek,
            position,
            slotIndex,
            isLocked: false,
          },
        });
      }

      // Update trade status
      await tx.trade.update({
        where: { id: tradeId },
        data: {
          status: "accepted",
          executedAt: new Date(),
        },
      });

      // Create transaction records for both teams
      await tx.transaction.create({
        data: {
          fantasyLeagueId: trade.fantasyLeagueId,
          fantasyTeamId: trade.proposerTeamId,
          userId: trade.proposerUserId,
          type: "trade",
          tradeId: trade.id,
          tradePartnerTeamId: trade.receiverTeamId,
          tradePartnerGave: trade.receiverGives,
          addTeamId: null,
          dropTeamId: null,
          status: "approved",
          processedAt: new Date(),
        },
      });

      await tx.transaction.create({
        data: {
          fantasyLeagueId: trade.fantasyLeagueId,
          fantasyTeamId: trade.receiverTeamId,
          userId: trade.receiverUserId,
          type: "trade",
          tradeId: trade.id,
          tradePartnerTeamId: trade.proposerTeamId,
          tradePartnerGave: trade.proposerGives,
          addTeamId: null,
          dropTeamId: null,
          status: "approved",
          processedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Trade processed successfully",
    });
  } catch (error) {
    console.error("Error processing trade:", error);
    return NextResponse.json(
      { error: "Failed to process trade" },
      { status: 500 }
    );
  }
}
