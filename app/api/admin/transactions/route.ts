import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/transactions
 * Get all transactions (waivers, trades, history) for admin panel
 * Query params: ?leagueId=optional
 */
export async function GET(req: NextRequest) {
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

    const url = new URL(req.url);
    const leagueId = url.searchParams.get("leagueId");

    // Get all fantasy leagues
    const leagues = await prisma.fantasyLeague.findMany({
      select: {
        id: true,
        name: true,
        season: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Build where clause for filtering by league
    const leagueFilter = leagueId ? { fantasyLeagueId: leagueId } : {};

    // Get pending waiver claims
    const pendingWaivers = await prisma.waiverClaim.findMany({
      where: {
        ...leagueFilter,
        status: "pending",
      },
      include: {
        fantasyTeam: {
          select: {
            displayName: true,
          },
        },
        user: {
          select: {
            displayName: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        priority: "asc",
      },
    });

    // Get pending trades
    const pendingTrades = await prisma.trade.findMany({
      where: {
        ...leagueFilter,
        status: "pending",
      },
      include: {
        proposerTeam: {
          select: {
            displayName: true,
          },
        },
        receiverTeam: {
          select: {
            displayName: true,
          },
        },
        proposer: {
          select: {
            displayName: true,
          },
        },
        receiver: {
          select: {
            displayName: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get transaction history from Transaction table
    const transactionHistory = await prisma.transaction.findMany({
      where: leagueFilter,
      include: {
        fantasyTeam: {
          select: {
            displayName: true,
          },
        },
        user: {
          select: {
            displayName: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        processedAt: "desc",
      },
      take: 50,
    });

    // Format pending waivers
    const formattedPendingWaivers = pendingWaivers.map((claim) => ({
      id: claim.id,
      priority: claim.priority,
      manager: claim.user.displayName,
      teamName: claim.fantasyTeam.displayName,
      fantasyLeague: claim.league.id,
      fantasyLeagueName: claim.league.name,
      addTeamId: claim.addTeamId,
      dropTeamId: claim.dropTeamId,
      faabBid: claim.faabBid,
      status: claim.status,
      submitted: claim.createdAt,
    }));

    // Format pending trades
    const formattedPendingTrades = pendingTrades.map((trade) => ({
      id: trade.id,
      fantasyLeague: trade.league.id,
      fantasyLeagueName: trade.league.name,
      proposer: trade.proposer.displayName,
      proposerTeam: trade.proposerTeam.displayName,
      receiver: trade.receiver.displayName,
      receiverTeam: trade.receiverTeam.displayName,
      proposerGives: trade.proposerGives,
      receiverGives: trade.receiverGives,
      status: trade.status,
      submitted: trade.createdAt,
    }));

    // Format transaction history
    const formattedHistory = transactionHistory.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      fantasyLeague: transaction.league.id,
      fantasyLeagueName: transaction.league.name,
      manager: transaction.user.displayName,
      teamName: transaction.fantasyTeam.displayName,
      addTeamId: transaction.addTeamId,
      dropTeamId: transaction.dropTeamId,
      status: transaction.status,
      processed: transaction.processedAt,
      reason: transaction.reason,
    }));

    return NextResponse.json({
      leagues,
      pendingWaivers: formattedPendingWaivers,
      pendingTrades: formattedPendingTrades,
      transactionHistory: formattedHistory,
    });
  } catch (error) {
    console.error("Error fetching admin transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
