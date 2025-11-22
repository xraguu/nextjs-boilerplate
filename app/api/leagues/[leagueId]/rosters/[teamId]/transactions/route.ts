import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leagues/[leagueId]/rosters/[teamId]/transactions
 * Get transaction history for a fantasy team
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

    // Verify the fantasy team exists and user has access
    const fantasyTeam = await prisma.fantasyTeam.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        fantasyLeagueId: true,
        ownerUserId: true,
        displayName: true,
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

    // Get transactions for this team
    const transactions = await prisma.transaction.findMany({
      where: {
        fantasyTeamId: teamId,
      },
      orderBy: {
        processedAt: "desc",
      },
    });

    // Format transactions
    const formattedTransactions = transactions.map((transaction) => {
      if (transaction.type === "trade") {
        return {
          id: transaction.id,
          type: "trade",
          fromTeam: fantasyTeam.displayName,
          fromManager: fantasyTeam.owner.displayName,
          toTeam: "Trade Partner", // TODO: Fetch actual partner team name
          toManager: "Trade Partner Manager", // TODO: Fetch actual partner manager
          givingTeams: transaction.dropTeamId ? [transaction.dropTeamId] : [],
          receivingTeams: transaction.addTeamId ? [transaction.addTeamId] : [],
          status: transaction.status === "approved" ? "Accepted" : "Denied",
          timestamp: transaction.processedAt,
        };
      } else {
        return {
          id: transaction.id,
          type: transaction.type === "waiver" ? "waiver" : "fa-pickup",
          addTeamId: transaction.addTeamId,
          dropTeamId: transaction.dropTeamId,
          faabBid: transaction.faabBid,
          status: transaction.status === "approved" ? "Successful" :
                  transaction.status === "denied" ? "Failed - Lower Priority" :
                  transaction.status === "failed" ? "Failed" :
                  "Pending",
          timestamp: transaction.processedAt,
        };
      }
    });

    return NextResponse.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
